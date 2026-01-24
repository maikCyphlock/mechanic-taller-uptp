import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { inventory, syncQueue } from '~/server/db/schema';
import { getOdooClient } from '../odoo-client';
import { isSyncEnabled } from '../odoo.config';
import type { OdooProduct, SyncResult, SyncStatusType } from '../sync-types';
import { SyncStatus } from '../sync-types';
import { nanoid } from 'nanoid';

/**
 * Conector para sincronización de inventario entre Local ↔ Odoo
 */

/**
 * Mapear producto de Odoo a formato local
 */
function mapOdooProductToLocal(odooProduct: OdooProduct) {
    return {
        id: nanoid(),
        name: odooProduct.name || '',
        description: odooProduct.description || '',
        serialNumber: odooProduct.serial_number || '',
        quantity: odooProduct.quantity || 0,
        price: odooProduct.price?.toString() || '0',
        odooId: odooProduct.id,
        syncStatus: SyncStatus.SYNCED as SyncStatusType,
        syncedAt: new Date(),
        syncError: null,
    };
}

/**
 * Mapear producto local a formato Odoo
 */
function mapLocalProductToOdoo(localItem: typeof inventory.$inferSelect) {
    return {
        name: localItem.name,
        description: localItem.description || '',
        serial_number: localItem.serialNumber || '',
        quantity: localItem.quantity || 0,
        price: parseFloat(localItem.price || '0'),
    };
}

/**
 * Sincronizar inventario DESDE Odoo (importar)
 */
export async function syncInventoryFromOdoo(): Promise<SyncResult> {
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

        // Obtener inventario de Odoo
        const response = await odooClient.getInventory();

        if (response.status !== 'success' || !response.data) {
            return {
                success: false,
                error: response.error || 'Error al obtener inventario de Odoo',
            };
        }

        const odooProducts = response.data as OdooProduct[];
        let synced = 0;
        let failed = 0;

        for (const odooProduct of odooProducts) {
            try {
                // Verificar si ya existe localmente (por odooId)
                const existing = await db.query.inventory.findFirst({
                    where: eq(inventory.odooId, odooProduct.id),
                });

                if (existing) {
                    // Actualizar item existente
                    await db
                        .update(inventory)
                        .set({
                            name: odooProduct.name || existing.name,
                            description: odooProduct.description || existing.description,
                            serialNumber: odooProduct.serial_number || existing.serialNumber,
                            quantity: odooProduct.quantity || existing.quantity,
                            price: odooProduct.price?.toString() || existing.price,
                            syncStatus: SyncStatus.SYNCED,
                            syncedAt: new Date(),
                            syncError: null,
                            updatedAt: new Date(),
                        })
                        .where(eq(inventory.id, existing.id));
                } else {
                    // Crear nuevo item local
                    const newItem = mapOdooProductToLocal(odooProduct);
                    await db.insert(inventory).values(newItem);
                }

                synced++;
            } catch (error) {
                console.error(`Error sincronizando producto ${odooProduct.id}:`, error);
                failed++;
            }
        }

        return {
            success: true,
            itemsSynced: synced,
            itemsFailed: failed,
        };
    } catch (error) {
        console.error('Error en syncInventoryFromOdoo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}

/**
 * Sincronizar inventario HACIA Odoo (exportar)
 */
export async function syncInventoryToOdoo(): Promise<SyncResult> {
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

        // Obtener productos locales que necesitan sincronización
        const itemsToSync = await db.query.inventory.findMany({
            where: (inventory, { or, eq }) =>
                or(
                    eq(inventory.syncStatus, SyncStatus.NOT_SYNCED),
                    eq(inventory.syncStatus, SyncStatus.PENDING),
                    eq(inventory.syncStatus, SyncStatus.ERROR)
                ),
        });

        let synced = 0;
        let failed = 0;

        for (const localItem of itemsToSync) {
            try {
                const odooData = mapLocalProductToOdoo(localItem);

                if (localItem.odooId) {
                    // Actualizar en Odoo
                    const response = await odooClient.updateInventoryItem(localItem.odooId, odooData);

                    if (response.status === 'success') {
                        await db
                            .update(inventory)
                            .set({
                                syncStatus: SyncStatus.SYNCED,
                                syncedAt: new Date(),
                                syncError: null,
                                updatedAt: new Date(),
                            })
                            .where(eq(inventory.id, localItem.id));
                        synced++;
                    } else {
                        throw new Error(response.error || 'Error actualizando en Odoo');
                    }
                } else {
                    // Crear en Odoo
                    const response = await odooClient.createInventoryItem(odooData);

                    if (response.status === 'success' && response.id) {
                        await db
                            .update(inventory)
                            .set({
                                odooId: response.id as number,
                                syncStatus: SyncStatus.SYNCED,
                                syncedAt: new Date(),
                                syncError: null,
                                updatedAt: new Date(),
                            })
                            .where(eq(inventory.id, localItem.id));
                        synced++;
                    } else {
                        throw new Error(response.error || 'Error creando en Odoo');
                    }
                }
            } catch (error) {
                console.error(`Error sincronizando producto ${localItem.id}:`, error);

                // Marcar como error
                await db
                    .update(inventory)
                    .set({
                        syncStatus: SyncStatus.ERROR,
                        syncError: error instanceof Error ? error.message : 'Error desconocido',
                        updatedAt: new Date(),
                    })
                    .where(eq(inventory.id, localItem.id));

                failed++;
            }
        }

        return {
            success: true,
            itemsSynced: synced,
            itemsFailed: failed,
        };
    } catch (error) {
        console.error('Error en syncInventoryToOdoo:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
