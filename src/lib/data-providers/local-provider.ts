/**
 * Local Data Provider
 * 
 * Implementation of DataProvider that uses the local SQLite database via Drizzle ORM.
 * This provider is the source of truth when DATA_PROVIDER='local'.
 */

import { eq, like, or, and, isNull, desc } from 'drizzle-orm';
import { db } from '~/server/db';
import { client, vehicle, ticket } from '~/server/db/schema';
import { nanoid } from 'nanoid';
import type { DataProvider } from './data-provider';
import type {
    Client,
    CreateClientInput,
    UpdateClientInput,
    Vehicle,
    CreateVehicleInput,
    UpdateVehicleInput,
    Ticket,
    CreateTicketInput,
    UpdateTicketInput,
    TicketFilters,
    Brand,
    Model,
    ProviderStatus,
} from './types';

// =============================================================================
// Helper Functions
// =============================================================================

function mapDbClientToClient(dbClient: typeof client.$inferSelect): Client {
    return {
        id: dbClient.id,
        name: dbClient.name,
        email: dbClient.email,
        phone: dbClient.phone,
        cedula: dbClient.cedula,
        street: dbClient.address,
        city: dbClient.city,
        createdAt: dbClient.createdAt,
        updatedAt: dbClient.updatedAt,
    };
}

function mapDbVehicleToVehicle(
    dbVehicle: typeof vehicle.$inferSelect,
    ownerName?: string | null
): Vehicle {
    return {
        id: dbVehicle.id,
        name: `${dbVehicle.make} ${dbVehicle.model} - ${dbVehicle.plate}`.trim(),
        licensePlate: dbVehicle.plate || '',
        brand: dbVehicle.make || '',
        model: dbVehicle.model || '',
        year: dbVehicle.year,
        color: dbVehicle.color,
        ownerId: dbVehicle.ownerId,
        ownerName: ownerName,
        createdAt: dbVehicle.createdAt,
        updatedAt: dbVehicle.updatedAt,
    };
}

function mapDbTicketToTicket(
    dbTicket: typeof ticket.$inferSelect & {
        client?: typeof client.$inferSelect | null;
        vehicle?: typeof vehicle.$inferSelect | null;
        assignedUser?: { name: string } | null;
    }
): Ticket {
    return {
        id: dbTicket.id,
        title: dbTicket.short_description || 'Sin título',
        description: dbTicket.description,
        status: dbTicket.status.toLowerCase(),
        requestDate: dbTicket.createdAt,
        clientId: dbTicket.clientId,
        clientName: dbTicket.client?.name,
        vehicleId: dbTicket.vehicleId,
        vehiclePlate: dbTicket.vehicle?.plate,
        vehicleBrand: dbTicket.vehicle?.make,
        vehicleModel: dbTicket.vehicle?.model,
        mechanicId: dbTicket.assignedTo,
        mechanicName: dbTicket.assignedUser?.name,
        createdAt: dbTicket.createdAt,
        updatedAt: dbTicket.updatedAt,
    };
}

// =============================================================================
// Local Data Provider Implementation
// =============================================================================

export class LocalDataProvider implements DataProvider {
    // =========================================================================
    // Provider Info
    // =========================================================================

    getProviderName(): 'local' {
        return 'local';
    }

    async isAvailable(): Promise<boolean> {
        try {
            // Simple query to check if database is accessible
            await db.query.client.findFirst();
            return true;
        } catch (error) {
            console.error('[LocalDataProvider] Database not available:', error);
            return false;
        }
    }

    async getStatus(): Promise<ProviderStatus> {
        const available = await this.isAvailable();
        return {
            available,
            providerName: 'local',
            message: available
                ? 'Base de datos local disponible'
                : 'Base de datos local no disponible',
        };
    }

    // =========================================================================
    // Clients
    // =========================================================================

    async getClients(): Promise<Client[]> {
        const clients = await db.query.client.findMany({
            where: isNull(client.delete_at),
            orderBy: desc(client.createdAt),
        });
        return clients.map(mapDbClientToClient);
    }

    async getClient(id: string | number): Promise<Client | null> {
        const dbClient = await db.query.client.findFirst({
            where: and(eq(client.id, String(id)), isNull(client.delete_at)),
        });
        return dbClient ? mapDbClientToClient(dbClient) : null;
    }

    async searchClients(query: string): Promise<Client[]> {
        if (!query || query.length < 2) return [];

        const searchPattern = `%${query}%`;
        const clients = await db.query.client.findMany({
            where: and(
                isNull(client.delete_at),
                or(
                    like(client.name, searchPattern),
                    like(client.cedula, searchPattern),
                    like(client.phone, searchPattern),
                    like(client.email, searchPattern)
                )
            ),
            limit: 10,
        });
        return clients.map(mapDbClientToClient);
    }

    async createClient(data: CreateClientInput): Promise<Client> {
        const id = nanoid();
        const now = new Date();

        await db.insert(client).values({
            id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            cedula: data.cedula,
            createdAt: now,
            updatedAt: now,
        });

        const created = await this.getClient(id);
        if (!created) throw new Error('Failed to create client');
        return created;
    }

    async updateClient(id: string | number, data: UpdateClientInput): Promise<Client> {
        await db
            .update(client)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(client.id, String(id)));

        const updated = await this.getClient(id);
        if (!updated) throw new Error('Client not found');
        return updated;
    }

    // =========================================================================
    // Vehicles
    // =========================================================================

    async getVehicles(): Promise<Vehicle[]> {
        const vehicles = await db.query.vehicle.findMany({
            where: isNull(vehicle.delete_at),
            with: { owner: true },
            orderBy: desc(vehicle.createdAt),
        });
        return vehicles.map((v) => mapDbVehicleToVehicle(v, v.owner?.name));
    }

    async getVehicle(id: string | number): Promise<Vehicle | null> {
        const dbVehicle = await db.query.vehicle.findFirst({
            where: and(eq(vehicle.id, String(id)), isNull(vehicle.delete_at)),
            with: { owner: true },
        });
        return dbVehicle ? mapDbVehicleToVehicle(dbVehicle, dbVehicle.owner?.name) : null;
    }

    async getClientVehicles(clientId: string | number): Promise<Vehicle[]> {
        const vehicles = await db.query.vehicle.findMany({
            where: and(
                eq(vehicle.ownerId, String(clientId)),
                isNull(vehicle.delete_at)
            ),
            with: { owner: true },
        });
        return vehicles.map((v) => mapDbVehicleToVehicle(v, v.owner?.name));
    }

    async createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
        const id = nanoid();
        const now = new Date();

        await db.insert(vehicle).values({
            id,
            plate: data.licensePlate,
            make: data.brand,
            model: data.model,
            year: data.year,
            color: data.color,
            ownerId: data.ownerId ? String(data.ownerId) : null,
            type: 'otro',
            syncStatus: 'not_synced',
            createdAt: now,
            updatedAt: now,
        });

        const created = await this.getVehicle(id);
        if (!created) throw new Error('Failed to create vehicle');
        return created;
    }

    async updateVehicle(id: string | number, data: UpdateVehicleInput): Promise<Vehicle> {
        const updateData: Partial<typeof vehicle.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (data.licensePlate !== undefined) updateData.plate = data.licensePlate;
        if (data.brand !== undefined) updateData.make = data.brand;
        if (data.model !== undefined) updateData.model = data.model;
        if (data.year !== undefined) updateData.year = data.year;
        if (data.color !== undefined) updateData.color = data.color;
        if (data.ownerId !== undefined) updateData.ownerId = data.ownerId ? String(data.ownerId) : null;

        await db.update(vehicle).set(updateData).where(eq(vehicle.id, String(id)));

        const updated = await this.getVehicle(id);
        if (!updated) throw new Error('Vehicle not found');
        return updated;
    }

    // =========================================================================
    // Tickets
    // =========================================================================

    async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
        const whereConditions: any[] = [isNull(ticket.delete_at)];

        if (filters?.status) {
            whereConditions.push(eq(ticket.status, filters.status.toUpperCase()));
        }
        if (filters?.clientId) {
            whereConditions.push(eq(ticket.clientId, String(filters.clientId)));
        }
        if (filters?.vehicleId) {
            whereConditions.push(eq(ticket.vehicleId, String(filters.vehicleId)));
        }
        if (filters?.mechanicId) {
            whereConditions.push(eq(ticket.assignedTo, String(filters.mechanicId)));
        }

        const tickets = await db.query.ticket.findMany({
            where: and(...whereConditions),
            with: {
                client: true,
                vehicle: true,
                assignedUser: true,
            },
            orderBy: desc(ticket.createdAt),
        });

        return tickets.map(mapDbTicketToTicket);
    }

    async getTicket(id: string | number): Promise<Ticket | null> {
        const dbTicket = await db.query.ticket.findFirst({
            where: and(eq(ticket.id, String(id)), isNull(ticket.delete_at)),
            with: {
                client: true,
                vehicle: true,
                assignedUser: true,
            },
        });
        return dbTicket ? mapDbTicketToTicket(dbTicket) : null;
    }

    async getClientTickets(clientId: string | number): Promise<Ticket[]> {
        return this.getTickets({ clientId });
    }

    async getVehicleTickets(vehicleId: string | number): Promise<Ticket[]> {
        return this.getTickets({ vehicleId });
    }

    async createTicket(data: CreateTicketInput): Promise<Ticket> {
        const id = nanoid();
        const now = new Date();

        await db.insert(ticket).values({
            id,
            short_description: data.title,
            description: data.description,
            vehicleId: String(data.vehicleId),
            clientId: String(data.clientId),
            status: 'ABIERTO',
            priority: 'MEDIA',
            syncStatus: 'not_synced',
            createdAt: now,
            updatedAt: now,
        });

        const created = await this.getTicket(id);
        if (!created) throw new Error('Failed to create ticket');
        return created;
    }

    async updateTicket(id: string | number, data: UpdateTicketInput): Promise<Ticket> {
        const updateData: Partial<typeof ticket.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (data.title !== undefined) updateData.short_description = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status.toUpperCase() as any;
        if (data.clientId !== undefined) updateData.clientId = String(data.clientId);
        if (data.vehicleId !== undefined) updateData.vehicleId = String(data.vehicleId);

        await db.update(ticket).set(updateData).where(eq(ticket.id, String(id)));

        const updated = await this.getTicket(id);
        if (!updated) throw new Error('Ticket not found');
        return updated;
    }

    async deleteTicket(id: string | number): Promise<void> {
        // Soft delete
        await db
            .update(ticket)
            .set({
                delete_at: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(ticket.id, String(id)));
    }

    // =========================================================================
    // Reference Data (Brands & Models)
    // =========================================================================

    async getBrands(): Promise<Brand[]> {
        // In local mode, we extract unique brands from existing vehicles
        const vehicles = await db.query.vehicle.findMany({
            where: isNull(vehicle.delete_at),
            columns: { make: true },
        });

        const uniqueBrands = [...new Set(vehicles.map((v) => v.make).filter(Boolean))];
        return uniqueBrands.map((name, index) => ({
            id: index + 1,
            name: name!,
        }));
    }

    async getModels(brandId?: number): Promise<Model[]> {
        // In local mode, we extract unique models from existing vehicles
        // If brandId is provided, we filter by brand first
        const brands = await this.getBrands();
        const brandName = brandId ? brands.find((b) => b.id === brandId)?.name : undefined;

        const whereCondition = brandName
            ? and(isNull(vehicle.delete_at), eq(vehicle.make, brandName))
            : isNull(vehicle.delete_at);

        const vehicles = await db.query.vehicle.findMany({
            where: whereCondition,
            columns: { make: true, model: true },
        });

        const modelsMap = new Map<string, { name: string; brandName: string }>();
        vehicles.forEach((v) => {
            if (v.model && v.make) {
                modelsMap.set(`${v.make}-${v.model}`, { name: v.model, brandName: v.make });
            }
        });

        return Array.from(modelsMap.values()).map((m, index) => ({
            id: index + 1,
            name: m.name,
            brandId: brands.find((b) => b.name === m.brandName)?.id || 0,
        }));
    }
}
