import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { vehicle, syncQueue } from '~/server/db/schema';
import { getOdooClient } from '../odoo-client';
import { isSyncEnabled } from '../odoo.config';
import type { OdooVehicle, SyncResult, SyncStatusType } from '../sync-types';
import { SyncStatus } from '../sync-types';
import { nanoid } from 'nanoid';

/**
 * Conector para sincronización de vehículos entre Local ↔ Odoo
 */

/**
 * Mapear vehículo de Odoo a formato local
 */
function mapOdooVehicleToLocal(odooVehicle: OdooVehicle) {
    return {
        id: nanoid(),
        plate: odooVehicle.license_plate || '',
        make: odooVehicle.brand || '',
        model: odooVehicle.model || '',
        year: odooVehicle.year || null,
        color: null, // Odoo no tiene este campo en fleet.vehicle
        type: 'otro' as const, // Default
        ownerId: null, // Requiere mapear owner_id de Odoo a client local
        odooId: odooVehicle.id,
        syncStatus: SyncStatus.SYNCED as SyncStatusType,
        syncedAt: new Date(),
        syncError: null,
    };
}

/**
 * Mapear vehículo local a formato Odoo
 */
function mapLocalVehicleToOdoo(localVehicle: typeof vehicle.$inferSelect) {
    return {
        license_plate: localVehicle.plate || '',
        vin: '', // No tenemos VIN en el esquema local actual
        year: localVehicle.year || null,
        brand: localVehicle.make || '',
        model: localVehicle.model || '',
        owner_id: false, // Requiere mapear ownerId local a partner de Odoo
    };
}

/**
 * Sincronizar vehículos DESDE Odoo (importar)
 */
export async function syncVehiclesFromOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return {
            success: false,
            error: 'Sincronización con Odoo está deshabilitada',
        };
    }

    try {
        const odooClient = getOdooClient();

        // Verificar que Odoo esté disponible
        const isAvailable = await odooClient.isAvailable();
        if (!isAvailable) {
            return {
                success: false,
                error: 'Odoo no está disponible actualmente',
            };
        }

        // Obtener vehículos de Odoo
        console.log('[VehicleConnector] Llamando a odooClient.getVehicles()...');
        const response = await odooClient.getVehicles();
        console.log('[VehicleConnector] Respuesta de getVehicles:', JSON.stringify(response, null, 2));

        if (response.status !== 'success' || !response.data) {
            console.error('[VehicleConnector] Error o sin datos:', response);
            return {
                success: false,
                error: response.error || 'Error al obtener vehículos de Odoo',
            };
        }

        const odooVehicles = response.data as OdooVehicle[];
        console.log(`[VehicleConnector] Recibidos ${odooVehicles.length} vehículos de Odoo`);
        let synced = 0;
        let failed = 0;

        for (const odooVehicle of odooVehicles) {
            try {
                // Verificar si ya existe localmente (por odooId)
                const existing = await db.query.vehicle.findFirst({
                    where: eq(vehicle.odooId, odooVehicle.id),
                });

                if (existing) {
                    // Actualizar vehículo existente
                    await db
                        .update(vehicle)
                        .set({
                            plate: odooVehicle.license_plate || existing.plate,
                            make: odooVehicle.brand || existing.make,
                            model: odooVehicle.model || existing.model,
                            year: odooVehicle.year || existing.year,
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                            syncError: null,
                            updatedAt: new Date(),
                        })
                        .where(eq(vehicle.id, existing.id));
                } else {
                    // Crear nuevo vehículo local
                    const newVehicle = mapOdooVehicleToLocal(odooVehicle);
                    await db.insert(vehicle).values(newVehicle);
                }

                synced++;
            } catch (error) {
                console.error(`Error sincronizando vehículo ${odooVehicle.id}:`, error);
                failed++;
            }
        }

        return {
            success: true,
            itemsSynced: synced,
            itemsFailed: failed,
        };
    } catch (error) {
        console.error('Error en syncVehiclesFromOdoo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Sincronizar vehículos HACIA Odoo (exportar)
 */
export async function syncVehiclesToOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return {
            success: false,
            error: 'Sincronización con Odoo está deshabilitada',
        };
    }

    try {
        const odooClient = getOdooClient();

        // Verificar que Odoo esté disponible
        const isAvailable = await odooClient.isAvailable();
        if (!isAvailable) {
            return {
                success: false,
                error: 'Odoo no está disponible actualmente',
            };
        }

        // Obtener vehículos locales que necesitan sincronización
        const vehiclesToSync = await db.query.vehicle.findMany({
            where: (vehicle, { or, eq }) =>
                or(
                    eq(vehicle.syncStatus, SyncStatus.NOT_SYNCED),
                    eq(vehicle.syncStatus, SyncStatus.PENDING),
                    eq(vehicle.syncStatus, SyncStatus.ERROR)
                ),
        });

        let synced = 0;
        let failed = 0;

        for (const localVehicle of vehiclesToSync) {
            try {
                const odooData = mapLocalVehicleToOdoo(localVehicle);

                if (localVehicle.odooId) {
                    // Actualizar en Odoo
                    const response = await odooClient.updateVehicle(localVehicle.odooId, odooData);

                    if (response.status === 'success') {
                        await db
                            .update(vehicle)
                            .set({
                                syncStatus: SyncStatus.SYNCED,
                                syncedAt: new Date(),
                                syncError: null,
                                updatedAt: new Date(),
                            })
                            .where(eq(vehicle.id, localVehicle.id));
                        synced++;
                    } else {
                        throw new Error(response.error || 'Error actualizando en Odoo');
                    }
                } else {
                    // Crear en Odoo
                    const response = await odooClient.createVehicle(odooData);

                    if (response.status === 'success' && response.id) {
                        await db
                            .update(vehicle)
                            .set({
                                odooId: response.id as number,
                                syncStatus: SyncStatus.SYNCED,
                                syncedAt: new Date(),
                                syncError: null,
                                updatedAt: new Date(),
                            })
                            .where(eq(vehicle.id, localVehicle.id));
                        synced++;
                    } else {
                        throw new Error(response.error || 'Error creando en Odoo');
                    }
                }
            } catch (error) {
                console.error(`Error sincronizando vehículo ${localVehicle.id}:`, error);

                // Marcar como error
                await db
                    .update(vehicle)
                    .set({
                        syncStatus: SyncStatus.ERROR,
                        syncError: error instanceof Error ? error.message : 'Error desconocido',
                        updatedAt: new Date(),
                    })
                    .where(eq(vehicle.id, localVehicle.id));

                failed++;
            }
        }

        return {
            success: true,
            itemsSynced: synced,
            itemsFailed: failed,
        };
    } catch (error) {
        console.error('Error en syncVehiclesToOdoo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Añadir vehículo a cola de sincronización
 */
export async function addVehicleToSyncQueue(
    vehicleId: string,
    operation: 'create' | 'update' | 'delete'
): Promise<void> {
    try {
        const vehicleData = await db.query.vehicle.findFirst({
            where: eq(vehicle.id, vehicleId),
        });

        await db.insert(syncQueue).values({
            id: nanoid(),
            entityType: 'vehicle',
            entityId: vehicleId,
            operation,
            data: vehicleData ? JSON.stringify(vehicleData) : null,
            attempts: 0,
            status: 'pending',
        });

        // Marcar vehículo como pendiente de sincronización
        await db
            .update(vehicle)
            .set({
                syncStatus: SyncStatus.PENDING,
                updatedAt: new Date(),
            })
            .where(eq(vehicle.id, vehicleId));
    } catch (error) {
        console.error('Error añadiendo vehículo a cola de sincronización:', error);
    }
}

/**
 * Procesar cola de sincronización de vehículos
 */
export async function processSyncQueueForVehicles(): Promise<SyncResult> {
    try {
        const queueItems = await db.query.syncQueue.findMany({
            where: (syncQueue, { and, eq }) =>
                and(
                    eq(syncQueue.entityType, 'vehicle'),
                    eq(syncQueue.status, 'pending')
                ),
        });

        let processed = 0;
        let failed = 0;

        for (const item of queueItems) {
            try {
                // Marcar como procesando
                await db
                    .update(syncQueue)
                    .set({ status: 'processing', updatedAt: new Date() })
                    .where(eq(syncQueue.id, item.id));

                // Intentar sincronizar
                const result = await syncVehiclesToOdoo();

                if (result.success) {
                    // Marcar como completado
                    await db
                        .update(syncQueue)
                        .set({ status: 'completed', updatedAt: new Date() })
                        .where(eq(syncQueue.id, item.id));
                    processed++;
                } else {
                    throw new Error(result.error || 'Error en sincronización');
                }
            } catch (error) {
                // Marcar como fallido
                await db
                    .update(syncQueue)
                    .set({
                        status: 'failed',
                        attempts: item.attempts + 1,
                        error: error instanceof Error ? error.message : 'Error desconocido',
                        lastAttempt: new Date(),
                        updatedAt: new Date(),
                    })
                    .where(eq(syncQueue.id, item.id));
                failed++;
            }
        }

        return {
            success: true,
            itemsSynced: processed,
            itemsFailed: failed,
        };
    } catch (error) {
        console.error('Error procesando cola de sincronización:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
