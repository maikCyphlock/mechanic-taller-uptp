/**
 * Odoo Data Provider
 * 
 * Implementation of DataProvider that connects to Odoo backend.
 * This provider is the source of truth when DATA_PROVIDER='odoo'.
 * 
 * Refactored from the existing src/lib/odoo/ and src/pages/api/odoo/ code.
 */

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
// Odoo Connection Configuration
// =============================================================================

function getOdooConfig() {
    const url = process.env.ODOO_URL;
    const db = process.env.ODOO_DB;
    const username = process.env.ODOO_USERNAME;
    const password = process.env.ODOO_PASSWORD;

    if (!url || !db || !username || !password) {
        throw new Error(
            'Missing Odoo credentials. Please configure ODOO_URL, ODOO_DB, ODOO_USERNAME, and ODOO_PASSWORD in .env'
        );
    }

    return { url, db, username, password };
}

// =============================================================================
// Odoo RPC Client
// =============================================================================

class OdooRpcClient {
    private config = getOdooConfig();
    private sessionId: string | null = null;

    private async authenticate(): Promise<string> {
        const res = await fetch(`${this.config.url}/web/session/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    db: this.config.db,
                    login: this.config.username,
                    password: this.config.password,
                },
                id: 1,
            }),
        });

        const cookies = res.headers.get('set-cookie');
        const match = cookies?.match(/session_id=([^;]+)/);
        if (match?.[1]) {
            this.sessionId = match[1];
            return this.sessionId;
        }
        throw new Error('Failed to authenticate with Odoo');
    }

    async call(model: string, method: string, args: any[], kwargs: any = {}): Promise<any> {
        if (!this.sessionId) {
            await this.authenticate();
        }

        const res = await fetch(`${this.config.url}/web/dataset/call_kw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `session_id=${this.sessionId}`,
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    model,
                    method,
                    args,
                    kwargs,
                },
                id: 2,
            }),
        });

        const data = await res.json();

        // Handle session expiry
        if (data.error?.data?.name === 'odoo.http.SessionExpiredException') {
            this.sessionId = null;
            return this.call(model, method, args, kwargs);
        }

        if (data.error) {
            throw new Error(data.error.data?.message || data.error.message || 'Odoo error');
        }

        return data.result;
    }

    async isAvailable(): Promise<boolean> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${this.config.url}/web/database/selector`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('[OdooDataProvider] Odoo not available:', error);
            return false;
        }
    }
}

// =============================================================================
// Odoo Data Provider Implementation
// =============================================================================

export class OdooDataProvider implements DataProvider {
    private rpc = new OdooRpcClient();

    // =========================================================================
    // Provider Info
    // =========================================================================

    getProviderName(): 'odoo' {
        return 'odoo';
    }

    async isAvailable(): Promise<boolean> {
        return this.rpc.isAvailable();
    }

    async getStatus(): Promise<ProviderStatus> {
        const available = await this.isAvailable();
        return {
            available,
            providerName: 'odoo',
            message: available
                ? 'Conectado a Odoo Backend'
                : 'Odoo no está disponible',
        };
    }

    // =========================================================================
    // Clients
    // =========================================================================

    async getClients(): Promise<Client[]> {
        const result = await this.rpc.call('res.partner', 'search_read', [
            [['is_mecatec_client', '=', true]],
            ['id', 'name', 'email', 'phone', 'vat', 'street', 'city', 'comment'],
        ]);
        return (result || []).map(this.mapOdooClient);
    }

    async getClient(id: string | number): Promise<Client | null> {
        const result = await this.rpc.call('res.partner', 'read', [
            [Number(id)],
            ['id', 'name', 'email', 'phone', 'vat', 'street', 'city', 'comment'],
        ]);
        return result?.[0] ? this.mapOdooClient(result[0]) : null;
    }

    async searchClients(query: string): Promise<Client[]> {
        if (!query || query.length < 2) return [];

        const result = await this.rpc.call('res.partner', 'search_read', [
            [
                '&',
                ['is_mecatec_client', '=', true],
                '|', '|', '|',
                ['name', 'ilike', query],
                ['vat', 'ilike', query],
                ['phone', 'ilike', query],
                ['email', 'ilike', query],
            ],
            ['id', 'name', 'email', 'phone', 'vat', 'street', 'city'],
        ]);
        return (result || []).slice(0, 10).map(this.mapOdooClient);
    }

    async createClient(data: CreateClientInput): Promise<Client> {
        // Check if client already exists
        const existing = await this.rpc.call('res.partner', 'search', [
            ['|', ['vat', '=', data.cedula], ['name', '=', data.name]],
        ]);

        if (existing?.length > 0) {
            const client = await this.getClient(existing[0]);
            if (client) return client;
        }

        const id = await this.rpc.call('res.partner', 'create', [
            {
                name: data.name,
                phone: data.phone,
                email: data.email,
                vat: data.cedula,
                is_mecatec_client: true,
            },
        ]);

        const created = await this.getClient(id);
        if (!created) throw new Error('Failed to create client in Odoo');
        return created;
    }

    async updateClient(id: string | number, data: UpdateClientInput): Promise<Client> {
        const updateData: Record<string, any> = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.cedula) updateData.vat = data.cedula;

        await this.rpc.call('res.partner', 'write', [[Number(id)], updateData]);

        const updated = await this.getClient(id);
        if (!updated) throw new Error('Client not found in Odoo');
        return updated;
    }

    private mapOdooClient(odoo: any): Client {
        return {
            id: odoo.id,
            name: odoo.name || '',
            email: odoo.email || null,
            phone: odoo.phone || null,
            cedula: odoo.vat || null,
            vat: odoo.vat || null,
            street: odoo.street || null,
            city: odoo.city || null,
            comment: odoo.comment || null,
        };
    }

    // =========================================================================
    // Vehicles
    // =========================================================================

    async getVehicles(): Promise<Vehicle[]> {
        const result = await this.rpc.call('fleet.vehicle', 'search_read', [
            [],
            ['id', 'name', 'license_plate', 'brand_id', 'model_id', 'owner_id', 'vin_sn', 'model_year', 'odometer', 'transmission'],
        ]);
        return (result || []).map(this.mapOdooVehicle);
    }

    async getVehicle(id: string | number): Promise<Vehicle | null> {
        const result = await this.rpc.call('fleet.vehicle', 'read', [
            [Number(id)],
            ['id', 'name', 'license_plate', 'brand_id', 'model_id', 'owner_id', 'vin_sn', 'model_year', 'odometer', 'transmission'],
        ]);
        return result?.[0] ? this.mapOdooVehicle(result[0]) : null;
    }

    async getClientVehicles(clientId: string | number): Promise<Vehicle[]> {
        const result = await this.rpc.call('fleet.vehicle', 'search_read', [
            [['owner_id', '=', Number(clientId)]],
            ['id', 'name', 'license_plate', 'brand_id', 'model_id'],
        ]);
        return (result || []).map(this.mapOdooVehicle);
    }

    async createVehicle(data: CreateVehicleInput): Promise<Vehicle> {
        // Resolve or create model
        let modelId = await this.rpc.call('fleet.vehicle.model', 'search', [
            [['name', '=', data.model]],
        ]);

        if (!modelId?.length) {
            // Resolve or create brand
            let brandId = await this.rpc.call('fleet.vehicle.model.brand', 'search', [
                [['name', '=', data.brand]],
            ]);
            if (!brandId?.length) {
                brandId = [await this.rpc.call('fleet.vehicle.model.brand', 'create', [{ name: data.brand }])];
            }
            modelId = [await this.rpc.call('fleet.vehicle.model', 'create', [
                { name: data.model, brand_id: brandId[0] },
            ])];
        }

        // Check if vehicle exists
        const existing = await this.rpc.call('fleet.vehicle', 'search', [
            [['license_plate', '=', data.licensePlate]],
        ]);

        if (existing?.length > 0) {
            const vehicle = await this.getVehicle(existing[0]);
            if (vehicle) return vehicle;
        }

        const id = await this.rpc.call('fleet.vehicle', 'create', [
            {
                license_plate: data.licensePlate,
                model_id: Number(modelId[0]),
                owner_id: data.ownerId ? Number(data.ownerId) : false,
            },
        ]);

        const created = await this.getVehicle(id);
        if (!created) throw new Error('Failed to create vehicle in Odoo');
        return created;
    }

    async updateVehicle(id: string | number, data: UpdateVehicleInput): Promise<Vehicle> {
        const updateData: Record<string, any> = {};
        if (data.licensePlate) updateData.license_plate = data.licensePlate;
        if (data.ownerId) updateData.owner_id = Number(data.ownerId);
        if (data.vin) updateData.vin_sn = data.vin;

        await this.rpc.call('fleet.vehicle', 'write', [[Number(id)], updateData]);

        const updated = await this.getVehicle(id);
        if (!updated) throw new Error('Vehicle not found in Odoo');
        return updated;
    }

    private mapOdooVehicle(odoo: any): Vehicle {
        return {
            id: odoo.id,
            name: odoo.name || '',
            licensePlate: odoo.license_plate || '',
            brand: Array.isArray(odoo.brand_id) ? odoo.brand_id[1] : '',
            model: Array.isArray(odoo.model_id) ? odoo.model_id[1] : '',
            year: odoo.model_year || null,
            vin: odoo.vin_sn || null,
            odometer: typeof odoo.odometer === 'number' ? odoo.odometer : null,
            transmission: odoo.transmission || null,
            ownerId: Array.isArray(odoo.owner_id) ? odoo.owner_id[0] : null,
            ownerName: Array.isArray(odoo.owner_id) ? odoo.owner_id[1] : null,
        };
    }

    // =========================================================================
    // Tickets
    // =========================================================================

    async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
        const domain: any[] = [];

        if (filters?.clientId) {
            domain.push(['client_id', '=', Number(filters.clientId)]);
        }
        if (filters?.vehicleId) {
            domain.push(['vehicle_id', '=', Number(filters.vehicleId)]);
        }

        const result = await this.rpc.call('maintenance.request', 'search_read', [
            domain,
            ['id', 'name', 'description', 'request_date', 'stage_id', 'user_id', 'client_id', 'vehicle_id'],
        ]);
        return (result || []).map(this.mapOdooTicket);
    }

    async getTicket(id: string | number): Promise<Ticket | null> {
        const result = await this.rpc.call('maintenance.request', 'read', [
            [Number(id)],
            ['id', 'name', 'description', 'request_date', 'stage_id', 'user_id', 'client_id', 'vehicle_id'],
        ]);
        return result?.[0] ? this.mapOdooTicket(result[0]) : null;
    }

    async getClientTickets(clientId: string | number): Promise<Ticket[]> {
        return this.getTickets({ clientId });
    }

    async getVehicleTickets(vehicleId: string | number): Promise<Ticket[]> {
        return this.getTickets({ vehicleId });
    }

    async createTicket(data: CreateTicketInput): Promise<Ticket> {
        const id = await this.rpc.call('maintenance.request', 'create', [
            {
                name: data.title,
                description: data.description,
                request_date: data.requestDate || new Date().toISOString().split('T')[0],
                client_id: Number(data.clientId),
                vehicle_id: Number(data.vehicleId),
            },
        ]);

        const created = await this.getTicket(id);
        if (!created) throw new Error('Failed to create ticket in Odoo');
        return created;
    }

    async updateTicket(id: string | number, data: UpdateTicketInput): Promise<Ticket> {
        const updateData: Record<string, any> = {};
        if (data.title) updateData.name = data.title;
        if (data.description) updateData.description = data.description;

        await this.rpc.call('maintenance.request', 'write', [[Number(id)], updateData]);

        const updated = await this.getTicket(id);
        if (!updated) throw new Error('Ticket not found in Odoo');
        return updated;
    }

    async deleteTicket(id: string | number): Promise<void> {
        await this.rpc.call('maintenance.request', 'unlink', [[Number(id)]]);
    }

    private mapOdooTicket(odoo: any): Ticket {
        return {
            id: odoo.id,
            title: odoo.name || 'Sin título',
            description: odoo.description || null,
            status: Array.isArray(odoo.stage_id) ? odoo.stage_id[1]?.toLowerCase() : 'abierto',
            requestDate: odoo.request_date || new Date().toISOString(),
            clientId: Array.isArray(odoo.client_id) ? odoo.client_id[0] : null,
            clientName: Array.isArray(odoo.client_id) ? odoo.client_id[1] : null,
            vehicleId: Array.isArray(odoo.vehicle_id) ? odoo.vehicle_id[0] : null,
            vehiclePlate: null, // Would need additional query
            vehicleBrand: null,
            vehicleModel: null,
            mechanicId: Array.isArray(odoo.user_id) ? odoo.user_id[0] : null,
            mechanicName: Array.isArray(odoo.user_id) ? odoo.user_id[1] : null,
        };
    }

    // =========================================================================
    // Reference Data (Brands & Models)
    // =========================================================================

    async getBrands(): Promise<Brand[]> {
        const result = await this.rpc.call('fleet.vehicle.model.brand', 'search_read', [
            [],
            ['id', 'name'],
        ]);
        return (result || []).map((b: any) => ({
            id: b.id,
            name: b.name,
        }));
    }

    async getModels(brandId?: number): Promise<Model[]> {
        const domain = brandId ? [['brand_id', '=', brandId]] : [];
        const result = await this.rpc.call('fleet.vehicle.model', 'search_read', [
            domain,
            ['id', 'name', 'brand_id'],
        ]);
        return (result || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            brandId: Array.isArray(m.brand_id) ? m.brand_id[0] : m.brand_id,
        }));
    }
}
