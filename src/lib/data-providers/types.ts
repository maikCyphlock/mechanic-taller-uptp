/**
 * Common TypeScript types for the data provider abstraction layer.
 * These types are used by both LocalDataProvider and OdooDataProvider.
 */

// =============================================================================
// Client Types
// =============================================================================

export interface Client {
    id: string | number;
    name: string;
    email?: string | null;
    phone?: string | null;
    cedula?: string | null; // Venezuelan ID (cédula)
    vat?: string | null;
    street?: string | null;
    city?: string | null;
    comment?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateClientInput {
    name: string;
    email?: string;
    phone?: string;
    cedula?: string;
}

export interface UpdateClientInput {
    name?: string;
    email?: string;
    phone?: string;
    cedula?: string;
}

// =============================================================================
// Vehicle Types
// =============================================================================

export interface Vehicle {
    id: string | number;
    name?: string;
    licensePlate: string;
    brand: string;
    model: string;
    year?: number | null;
    color?: string | null;
    vin?: string | null;
    odometer?: number | null;
    transmission?: string | null;
    ownerId?: string | number | null;
    ownerName?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateVehicleInput {
    licensePlate: string;
    brand: string;
    model: string;
    year?: number;
    color?: string;
    vin?: string;
    ownerId?: string | number;
}

export interface UpdateVehicleInput {
    licensePlate?: string;
    brand?: string;
    model?: string;
    year?: number;
    color?: string;
    vin?: string;
    ownerId?: string | number;
}

// =============================================================================
// Ticket Types
// =============================================================================

export type TicketStatus =
    | 'abierto'
    | 'en_proceso'
    | 'aprobado'
    | 'cerrado'
    | 'cancelado';

export interface Ticket {
    id: string | number;
    title: string;
    description?: string | null;
    status: TicketStatus | string;
    requestDate: Date | string;
    clientId?: string | number | null;
    clientName?: string | null;
    vehicleId?: string | number | null;
    vehiclePlate?: string | null;
    vehicleBrand?: string | null;
    vehicleModel?: string | null;
    mechanicId?: string | number | null;
    mechanicName?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateTicketInput {
    title: string;
    description?: string;
    clientId: string | number;
    vehicleId: string | number;
    requestDate?: Date | string;
}

export interface UpdateTicketInput {
    title?: string;
    description?: string;
    status?: TicketStatus | string;
    clientId?: string | number;
    vehicleId?: string | number;
}

export interface TicketFilters {
    status?: TicketStatus | string;
    clientId?: string | number;
    vehicleId?: string | number;
    mechanicId?: string | number;
    fromDate?: Date | string;
    toDate?: Date | string;
}

// =============================================================================
// Reference Data Types (Brands & Models)
// =============================================================================

export interface Brand {
    id: number;
    name: string;
}

export interface Model {
    id: number;
    name: string;
    brandId: number;
}

// =============================================================================
// Provider Info Types
// =============================================================================

export type DataProviderMode = 'local' | 'odoo';

export interface ProviderStatus {
    available: boolean;
    providerName: DataProviderMode;
    message?: string;
}
