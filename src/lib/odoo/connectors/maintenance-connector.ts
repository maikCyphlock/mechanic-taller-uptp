import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { ticket, syncQueue, vehicle } from '~/server/db/schema';
import { getOdooClient } from '../odoo-client';
import { isSyncEnabled } from '../odoo.config';
import type { OdooMaintenanceRequest, SyncResult, SyncStatusType } from '../sync-types';
import { SyncStatus } from '../sync-types';
import { nanoid } from 'nanoid';

/**
 * Conector para sincronización de tickets (mantenimiento) entre Local ↔ Odoo
 */

/**
 * Mapear requerimiento de Odoo a formato local
 */
async function mapOdooMaintenanceToLocal(odooM: OdooMaintenanceRequest) {
    // Buscar vehículo local por odooId
    let localVehicleId = null;
    if (odooM.vehicle_id) {
        const v = await db.query.vehicle.findFirst({
            where: eq(vehicle.odooId, odooM.vehicle_id),
        });
        localVehicleId = v?.id || null;
    }

    // Construir información del vehículo para agregar a la descripción
    let vehicleInfo = '';
    if (odooM.vehicle_brand || odooM.vehicle_model || odooM.vehicle_plate) {
        const parts = [];
        if (odooM.vehicle_brand && odooM.vehicle_model) {
            parts.push(`${odooM.vehicle_brand} ${odooM.vehicle_model}`);
        } else if (odooM.vehicle_brand) {
            parts.push(odooM.vehicle_brand);
        } else if (odooM.vehicle_model) {
            parts.push(odooM.vehicle_model);
        }
        if (odooM.vehicle_plate) {
            parts.push(`Placa: ${odooM.vehicle_plate}`);
        }
        vehicleInfo = `\n\n🚗 Vehículo: ${parts.join(' - ')}`;
    }

    return {
        id: nanoid(),
        vehicleId: localVehicleId || 'unknown', // Odoo requiere vehículo, localmente lo marcamos como unknown si no existe
        short_description: odooM.title || '',
        description: (odooM.description || '') + vehicleInfo,
        status: mapOdooStatusToLocal(odooM.status),
        odooId: odooM.id,
        syncStatus: SyncStatus.SYNCED as SyncStatusType,
        syncedAt: new Date(),
        syncError: null,
    };
}

function mapOdooStatusToLocal(odooStatus: string): any {
    const mapping: Record<string, string> = {
        'New Request': 'ABIERTO',
        'In Progress': 'EN_PROCESO',
        'Repaired': 'APROBADO',
        'Scrap': 'CANCELADO',
    };
    return mapping[odooStatus] || 'ABIERTO';
}

/**
 * Mapear ticket local a formato Odoo
 */
async function mapLocalTicketToOdoo(localTicket: typeof ticket.$inferSelect) {
    // Buscar odooId del vehículo
    let odooVehicleId: number | false = false;
    if (localTicket.vehicleId) {
        const v = await db.query.vehicle.findFirst({
            where: eq(vehicle.id, localTicket.vehicleId),
        });
        odooVehicleId = (v?.odooId as number) || false;
    }

    return {
        title: localTicket.short_description || `Ticket ${localTicket.id.slice(-8)}`,
        description: localTicket.description || '',
        date: localTicket.createdAt.toISOString().split('T')[0],
        vehicle_id: odooVehicleId,
    };
}

/**
 * Sincronizar tickets DESDE Odoo (importar)
 */
export async function syncTicketsFromOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return { success: false, error: 'Sync disabled' };
    }

    try {
        const odooClient = getOdooClient();
        const response = await odooClient.getMaintenance();

        if (response.status !== 'success' || !response.data) {
            return { success: false, error: response.error };
        }

        const odooRequests = response.data as OdooMaintenanceRequest[];
        let synced = 0;
        let failed = 0;

        for (const odooM of odooRequests) {
            try {
                const existing = await db.query.ticket.findFirst({
                    where: eq(ticket.odooId, odooM.id),
                });

                if (existing) {
                    await db.update(ticket).set({
                        short_description: odooM.title,
                        description: odooM.description,
                        status: mapOdooStatusToLocal(odooM.status),
                        syncStatus: SyncStatus.SYNCED,
                        syncedAt: new Date(),
                        updatedAt: new Date(),
                    }).where(eq(ticket.id, existing.id));
                } else {
                    const newTicket = await mapOdooMaintenanceToLocal(odooM);
                    // Solo insertar si tenemos vehículo (o permitir sin vehículo si el esquema lo permite)
                    await db.insert(ticket).values(newTicket as any);
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
 * Sincronizar tickets HACIA Odoo (exportar)
 */
export async function syncTicketsToOdoo(): Promise<SyncResult> {
    if (!isSyncEnabled()) {
        return { success: false, error: 'Sync disabled' };
    }

    try {
        const odooClient = getOdooClient();
        const ticketsToSync = await db.query.ticket.findMany({
            where: (ticket, { or, eq }) =>
                or(
                    eq(ticket.syncStatus, SyncStatus.NOT_SYNCED),
                    eq(ticket.syncStatus, SyncStatus.PENDING),
                    eq(ticket.syncStatus, SyncStatus.ERROR)
                ),
        });

        let synced = 0;
        let failed = 0;

        for (const localTicket of ticketsToSync) {
            try {
                const odooData = await mapLocalTicketToOdoo(localTicket);

                if (localTicket.odooId) {
                    const resp = await odooClient.updateMaintenance(localTicket.odooId, odooData);
                    if (resp.status === 'success') {
                        await db.update(ticket).set({
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                        }).where(eq(ticket.id, localTicket.id));
                        synced++;
                    } else throw new Error(resp.error);
                } else {
                    const resp = await odooClient.createMaintenance(odooData);
                    if (resp.status === 'success' && resp.id) {
                        await db.update(ticket).set({
                            odooId: resp.id,
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                        }).where(eq(ticket.id, localTicket.id));
                        synced++;
                    } else throw new Error(resp.error);
                }
            } catch (error) {
                console.error(error);
                await db.update(ticket).set({
                    syncStatus: SyncStatus.ERROR,
                    syncError: String(error),
                }).where(eq(ticket.id, localTicket.id));
                failed++;
            }
        }

        return { success: true, itemsSynced: synced, itemsFailed: failed };
    } catch (error) {
        return { success: false, error: String(error) };
    }
}
