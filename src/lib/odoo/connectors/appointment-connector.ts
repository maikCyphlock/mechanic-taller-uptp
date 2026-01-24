import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { appointment, client, vehicle, syncQueue } from '~/server/db/schema';
import { getOdooClient } from '../odoo-client';
import { isSyncEnabled } from '../odoo.config';
import type { OdooAppointment, SyncResult, SyncStatusType } from '../sync-types';
import { SyncStatus } from '../sync-types';
import { nanoid } from 'nanoid';

/**
 * Conector para sincronización de citas entre Local ↔ Odoo
 */

/**
 * Mapear cita de Odoo a formato local
 */
async function mapOdooAppointmentToLocal(odooApp: OdooAppointment) {
    // Buscar cliente local
    let localClientId = null;
    if (odooApp.client_id) {
        const c = await db.query.client.findFirst({
            where: (client, { like }) => like(client.name, `%${odooApp.client_id}%`) // Simplificación temporal
        });
        localClientId = c?.id || null;
    }

    // Buscar vehículo local
    let localVehicleId = null;
    if (odooApp.vehicle_id) {
        const v = await db.query.vehicle.findFirst({
            where: eq(vehicle.odooId, odooApp.vehicle_id),
        });
        localVehicleId = v?.id || null;
    }

    return {
        id: nanoid(),
        date: new Date(odooApp.date),
        clientId: localClientId,
        vehicleId: localVehicleId,
        reason: odooApp.reason || '',
        status: mapOdooStatusToLocal(odooApp.status),
        odooId: odooApp.id,
        syncStatus: SyncStatus.SYNCED as SyncStatusType,
        syncedAt: new Date(),
        syncError: null,
    };
}

function mapOdooStatusToLocal(odooStatus: string): any {
    const mapping: Record<string, string> = {
        'draft': 'PENDIENTE',
        'confirmed': 'CONFIRMADA',
        'done': 'COMPLETADA',
        'cancelled': 'CANCELADA',
    };
    return mapping[odooStatus] || 'PENDIENTE';
}

/**
 * Mapear cita local a formato Odoo
 */
async function mapLocalAppointmentToOdoo(localApp: typeof appointment.$inferSelect) {
    // Buscar odooId del vehículo
    let odooVehicleId = false;
    if (localApp.vehicleId) {
        const v = await db.query.vehicle.findFirst({
            where: eq(vehicle.id, localApp.vehicleId),
        });
        odooVehicleId = (v?.odooId as number) || false;
    }

    // Buscar odooId del cliente (si tuviéramos tabla cliente sincronizada con odooId)
    // Por ahora enviamos false o implementamos búsqueda si es crítico
    const odooClientId = false;

    return {
        date: localApp.date.toISOString(),
        client_id: odooClientId,
        vehicle_id: odooVehicleId,
        reason: localApp.reason || '',
        status: mapLocalStatusToOdoo(localApp.status),
    };
}

function mapLocalStatusToOdoo(localStatus: string): string {
    const mapping: Record<string, string> = {
        'PENDIENTE': 'draft',
        'CONFIRMADA': 'confirmed',
        'EN_CURSO': 'confirmed', // Odoo may not have in_progress for appointments
        'COMPLETADA': 'done',
        'CANCELADA': 'cancelled',
    };
    return mapping[localStatus] || 'draft';
}

/**
 * Sincronizar citas DESDE Odoo (importar)
 */
export async function syncAppointmentsFromOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return { success: false, error: 'Sync disabled' };
    }

    try {
        const odooClient = getOdooClient();
        const response = await odooClient.getAppointments();

        if (response.status !== 'success' || !response.data) {
            return { success: false, error: response.error };
        }

        const odooApps = response.data as OdooAppointment[];
        let synced = 0;
        let failed = 0;

        for (const odooApp of odooApps) {
            try {
                const existing = await db.query.appointment.findFirst({
                    where: eq(appointment.odooId, odooApp.id),
                });

                if (existing) {
                    await db.update(appointment).set({
                        reason: odooApp.reason,
                        status: mapOdooStatusToLocal(odooApp.status),
                        syncStatus: SyncStatus.SYNCED,
                        syncedAt: new Date(),
                        updatedAt: new Date(),
                    }).where(eq(appointment.id, existing.id));
                } else {
                    const newApp = await mapOdooAppointmentToLocal(odooApp);
                    await db.insert(appointment).values(newApp as any);
                }
                synced++;
            } catch (error) {
                console.error(error);
                failed++;
            }
        }

        return { success: true, itemsSynced: synced, itemsFailed: failed };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}

/**
 * Sincronizar citas HACIA Odoo (exportar)
 */
export async function syncAppointmentsToOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return { success: false, error: 'Sync disabled' };
    }

    try {
        const odooClient = getOdooClient();
        const appsToSync = await db.query.appointment.findMany({
            where: (appointment, { or, eq }) =>
                or(
                    eq(appointment.syncStatus, SyncStatus.NOT_SYNCED),
                    eq(appointment.syncStatus, SyncStatus.PENDING),
                    eq(appointment.syncStatus, SyncStatus.ERROR)
                ),
        });

        let synced = 0;
        let failed = 0;

        for (const localApp of appsToSync) {
            try {
                const odooData = await mapLocalAppointmentToOdoo(localApp);

                if (localApp.odooId) {
                    const resp = await odooClient.updateAppointment(localApp.odooId, odooData);
                    if (resp.status === 'success') {
                        await db.update(appointment).set({
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                        }).where(eq(appointment.id, localApp.id));
                        synced++;
                    } else throw new Error(resp.error);
                } else {
                    const resp = await odooClient.createAppointment(odooData);
                    if (resp.status === 'success' && resp.id) {
                        await db.update(appointment).set({
                            odooId: resp.id,
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                        }).where(eq(appointment.id, localApp.id));
                        synced++;
                    } else throw new Error(resp.error);
                }
            } catch (error) {
                console.error(error);
                await db.update(appointment).set({
                    syncStatus: SyncStatus.ERROR,
                    syncError: String(error),
                }).where(eq(appointment.id, localApp.id));
                failed++;
            }
        }

        return { success: true, itemsSynced: synced, itemsFailed: failed };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
