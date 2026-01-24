import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '~/server/api/trpc';
import { getOdooClient } from '~/lib/odoo/odoo-client';
import { isSyncEnabled } from '~/lib/odoo/odoo.config';
import {
    syncVehiclesFromOdoo,
    syncVehiclesToOdoo,
    processSyncQueueForVehicles,
} from '~/lib/odoo/connectors/vehicle-connector';
import {
    syncTicketsFromOdoo,
    syncTicketsToOdoo,
} from '~/lib/odoo/connectors/maintenance-connector';
import {
    syncInventoryFromOdoo,
    syncInventoryToOdoo,
} from '~/lib/odoo/connectors/inventory-connector';
import {
    syncAppointmentsFromOdoo,
    syncAppointmentsToOdoo,
} from '~/lib/odoo/connectors/appointment-connector';
import { syncQueue } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Router tRPC para operaciones de sincronización con Odoo
 * Solo accesible por usuarios con rol GERENTE o SUPERADMIN
 */
export const syncRouter = createTRPCRouter({
    /**
     * Verificar si Odoo está disponible (health check)
     */
    odooHealthCheck: protectedProcedure.query(async () => {
        if (!isSyncEnabled()) {
            return {
                available: false,
                message: 'Sincronización con Odoo está deshabilitada',
                syncEnabled: false,
            };
        }

        try {
            const odooClient = getOdooClient();
            const isAvailable = await odooClient.isAvailable();

            return {
                available: isAvailable,
                message: isAvailable
                    ? 'Odoo está disponible y responde correctamente'
                    : 'Odoo no está disponible actualmente',
                syncEnabled: true,
            };
        } catch (error) {
            return {
                available: false,
                message: error instanceof Error ? error.message : 'Error desconocido',
                syncEnabled: true,
            };
        }
    }),

    /**
     * Obtener estado de sincronización de todas las entidades
     */
    getSyncStatus: adminProcedure.query(async ({ ctx }) => {
        try {
            // Contar registros por estado de sincronización
            const vehiclesStatus = await ctx.db.query.vehicle.findMany({
                columns: {
                    syncStatus: true,
                },
            });

            const ticketsStatus = await ctx.db.query.ticket.findMany({
                columns: {
                    syncStatus: true,
                },
            });

            // Contar items en cola de sincronización
            const queueItems = await ctx.db.query.syncQueue.findMany();

            const countByStatus = (items: { syncStatus: string }[]) => {
                return items.reduce((acc, item) => {
                    acc[item.syncStatus] = (acc[item.syncStatus] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);
            };

            return {
                odooEnabled: isSyncEnabled(),
                vehicles: countByStatus(vehiclesStatus as { syncStatus: string }[]),
                tickets: countByStatus(ticketsStatus as { syncStatus: string }[]),
                queuePending: queueItems.filter((item) => item.status === 'pending').length,
                queueFailed: queueItems.filter((item) => item.status === 'failed').length,
                lastChecked: new Date(),
            };
        } catch (error) {
            throw new Error(
                `Error obteniendo estado de sincronización: ${error instanceof Error ? error.message : 'Error desconocido'}`
            );
        }
    }),

    /**
     * Sincronizar todo (todas las entidades)
     */
    syncAll: adminProcedure.mutation(async () => {
        if (!isSyncEnabled()) {
            throw new Error('Sincronización con Odoo está deshabilitada');
        }

        try {
            // Verificar que Odoo esté disponible
            const odooClient = getOdooClient();
            const isAvailable = await odooClient.isAvailable();

            if (!isAvailable) {
                throw new Error('Odoo no está disponible actualmente');
            }

            // Sincronizar todas las entidades
            const results = {
                vehicles: {
                    fromOdoo: await syncVehiclesFromOdoo(),
                    toOdoo: await syncVehiclesToOdoo(),
                },
                tickets: {
                    fromOdoo: await syncTicketsFromOdoo(),
                    toOdoo: await syncTicketsToOdoo(),
                },
                inventory: {
                    fromOdoo: await syncInventoryFromOdoo(),
                    toOdoo: await syncInventoryToOdoo(),
                },
                appointments: {
                    fromOdoo: await syncAppointmentsFromOdoo(),
                    toOdoo: await syncAppointmentsToOdoo(),
                },
            };

            return {
                success: true,
                message: 'Sincronización completa finalizada',
                results,
            };
        } catch (error) {
            throw new Error(
                `Error en sincronización completa: ${error instanceof Error ? error.message : 'Error desconocido'}`
            );
        }
    }),

    /**
     * Sincronizar solo vehículos
     */
    syncVehicles: adminProcedure
        .input(
            z.object({
                direction: z.enum(['from_odoo', 'to_odoo', 'both']).default('both'),
            })
        )
        .mutation(async ({ input }) => {
            if (!isSyncEnabled()) {
                throw new Error('Sincronización con Odoo está deshabilitada');
            }

            try {
                const odooClient = getOdooClient();
                const isAvailable = await odooClient.isAvailable();

                if (!isAvailable) {
                    throw new Error('Odoo no está disponible actualmente');
                }

                let fromOdooResult;
                let toOdooResult;

                if (input.direction === 'from_odoo' || input.direction === 'both') {
                    fromOdooResult = await syncVehiclesFromOdoo();
                }

                if (input.direction === 'to_odoo' || input.direction === 'both') {
                    toOdooResult = await syncVehiclesToOdoo();
                }

                return {
                    success: true,
                    message: 'Sincronización de vehículos finalizada',
                    fromOdoo: fromOdooResult,
                    toOdoo: toOdooResult,
                };
            } catch (error) {
                throw new Error(
                    `Error sincronizando vehículos: ${error instanceof Error ? error.message : 'Error desconocido'}`
                );
            }
        }),

    /**
     * Obtener cola de sincronización
     */
    getSyncQueue: adminProcedure
        .input(
            z
                .object({
                    entityType: z.enum(['inventory', 'vehicle', 'ticket', 'appointment']).optional(),
                    status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
                    limit: z.number().min(1).max(100).default(50),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const filters: any[] = [];

            if (input?.entityType) {
                filters.push(eq(syncQueue.entityType, input.entityType));
            }

            if (input?.status) {
                filters.push(eq(syncQueue.status, input.status));
            }

            const items = await ctx.db.query.syncQueue.findMany({
                where: filters.length > 0 ? (syncQueue, { and }) => and(...filters) : undefined,
                limit: input?.limit || 50,
                orderBy: (syncQueue, { desc }) => [desc(syncQueue.createdAt)],
            });

            return items;
        }),

    /**
     * Reintentar un item específico de la cola de sincronización
     */
    retrySyncItem: adminProcedure
        .input(
            z.object({
                itemId: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                const item = await ctx.db.query.syncQueue.findFirst({
                    where: eq(syncQueue.id, input.itemId),
                });

                if (!item) {
                    throw new Error('Item no encontrado en la cola');
                }

                // Marcar como pendiente para reintentar
                await ctx.db
                    .update(syncQueue)
                    .set({
                        status: 'pending',
                        error: null,
                        updatedAt: new Date(),
                    })
                    .where(eq(syncQueue.id, input.itemId));

                // Procesar según el tipo de entidad
                let result;
                switch (item.entityType) {
                    case 'vehicle':
                        result = await processSyncQueueForVehicles();
                        break;
                    // TODO: Añadir otros tipos cuando estén implementados
                    default:
                        throw new Error(`Tipo de entidad no soportado: ${item.entityType}`);
                }

                return {
                    success: true,
                    message: 'Item reintentado exitosamente',
                    result,
                };
            } catch (error) {
                throw new Error(
                    `Error reintentando item: ${error instanceof Error ? error.message : 'Error desconocido'}`
                );
            }
        }),

    /**
     * Limpiar items completados de la cola
     */
    clearCompletedQueue: adminProcedure.mutation(async ({ ctx }) => {
        try {
            await ctx.db.delete(syncQueue).where(eq(syncQueue.status, 'completed'));

            return {
                success: true,
                message: 'Items completados eliminados de la cola',
            };
        } catch (error) {
            throw new Error(
                `Error limpiando cola: ${error instanceof Error ? error.message : 'Error desconocido'}`
            );
        }
    }),
});
