/**
 * Abstract Data Provider Interface
 * 
 * This interface defines the contract that all data providers must implement.
 * It allows the application to work with different data sources (Local DB, Odoo)
 * through a unified API.
 */

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
    DataProviderMode,
    ProviderStatus,
} from './types';

export interface DataProvider {
    // =========================================================================
    // Provider Info
    // =========================================================================

    /**
     * Get the name of the data provider
     */
    getProviderName(): DataProviderMode;

    /**
     * Check if the data source is available and responding
     */
    isAvailable(): Promise<boolean>;

    /**
     * Get detailed status information about the provider
     */
    getStatus(): Promise<ProviderStatus>;

    // =========================================================================
    // Clients
    // =========================================================================

    /**
     * Get all clients
     */
    getClients(): Promise<Client[]>;

    /**
     * Get a single client by ID
     */
    getClient(id: string | number): Promise<Client | null>;

    /**
     * Search clients by query (name, cedula, phone)
     */
    searchClients(query: string): Promise<Client[]>;

    /**
     * Create a new client
     */
    createClient(data: CreateClientInput): Promise<Client>;

    /**
     * Update an existing client
     */
    updateClient(id: string | number, data: UpdateClientInput): Promise<Client>;

    // =========================================================================
    // Vehicles
    // =========================================================================

    /**
     * Get all vehicles
     */
    getVehicles(): Promise<Vehicle[]>;

    /**
     * Get a single vehicle by ID
     */
    getVehicle(id: string | number): Promise<Vehicle | null>;

    /**
     * Get vehicles owned by a specific client
     */
    getClientVehicles(clientId: string | number): Promise<Vehicle[]>;

    /**
     * Create a new vehicle
     */
    createVehicle(data: CreateVehicleInput): Promise<Vehicle>;

    /**
     * Update an existing vehicle
     */
    updateVehicle(id: string | number, data: UpdateVehicleInput): Promise<Vehicle>;

    // =========================================================================
    // Tickets
    // =========================================================================

    /**
     * Get all tickets, optionally filtered
     */
    getTickets(filters?: TicketFilters): Promise<Ticket[]>;

    /**
     * Get a single ticket by ID
     */
    getTicket(id: string | number): Promise<Ticket | null>;

    /**
     * Get tickets for a specific client
     */
    getClientTickets(clientId: string | number): Promise<Ticket[]>;

    /**
     * Get tickets for a specific vehicle
     */
    getVehicleTickets(vehicleId: string | number): Promise<Ticket[]>;

    /**
     * Create a new ticket
     */
    createTicket(data: CreateTicketInput): Promise<Ticket>;

    /**
     * Update an existing ticket
     */
    updateTicket(id: string | number, data: UpdateTicketInput): Promise<Ticket>;

    /**
     * Delete a ticket
     */
    deleteTicket(id: string | number): Promise<void>;

    // =========================================================================
    // Reference Data (Brands & Models)
    // =========================================================================

    /**
     * Get all vehicle brands
     */
    getBrands(): Promise<Brand[]>;

    /**
     * Get vehicle models, optionally filtered by brand
     */
    getModels(brandId?: number): Promise<Model[]>;
}
