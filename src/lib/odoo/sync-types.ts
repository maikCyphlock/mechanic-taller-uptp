/**
 * Tipos y enums para sincronización con Odoo
 */

export const SyncStatus = {
    NOT_SYNCED: 'not_synced',
    SYNCED: 'synced',
    PENDING: 'pending',
    ERROR: 'error',
    CONFLICT: 'conflict',
} as const;

export type SyncStatusType = typeof SyncStatus[keyof typeof SyncStatus];

export interface SyncMetadata {
    odooId?: number;
    syncStatus: SyncStatusType;
    syncedAt?: Date;
    syncError?: string;
}

/**
 * Resultado de operaciones de sincronización
 */
export interface SyncResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    itemsSynced?: number;
    itemsFailed?: number;
    conflicts?: SyncConflict[];
}

/**
 * Conflicto de sincronización
 */
export interface SyncConflict {
    localId: string;
    odooId: number;
    entityType: 'inventory' | 'vehicle' | 'ticket' | 'appointment';
    conflictType: 'both_modified' | 'deleted_remotely' | 'deleted_locally';
    localData: Record<string, unknown>;
    remoteData: Record<string, unknown>;
    lastSyncedAt?: Date;
}

/**
 * Item en cola de sincronización
 */
export interface SyncQueueItem {
    id: string;
    entityType: 'inventory' | 'vehicle' | 'ticket' | 'appointment';
    entityId: string;
    operation: 'create' | 'update' | 'delete';
    data?: Record<string, unknown>;
    attempts: number;
    lastAttempt?: Date;
    error?: string;
    createdAt: Date;
}

/**
 * Respuesta de la API de Odoo
 */
export interface OdooResponse<T = unknown> {
    status: 'success' | 'error';
    data?: T;
    id?: number; // ID del registro creado (para operaciones POST)
    message?: string;
    error?: string;
}

/**
 * Credenciales de Odoo
 */
export interface OdooCredentials {
    url: string;
    db: string;
    username: string;
    password: string;
}

/**
 * Configuración de sincronización
 */
export interface SyncConfig {
    enabled: boolean;
    autoSyncEnabled: boolean;
    syncIntervalMinutes: number;
    retryAttempts: number;
    timeoutMs: number;
}

/**
 * Mapeos de campos entre Odoo y Local
 */

// Inventario: product.template (Odoo) ↔ inventory (Local)
export interface OdooProduct {
    id: number;
    name: string;
    quantity: number; // qty_available
    description: string; // description_sale
    serial_number: string; // default_code
    price: number; // list_price
}

// Mantenimiento: maintenance.request (Odoo) ↔ ticket (Local)
export interface OdooMaintenanceRequest {
    id: number;
    title: string; // name
    description: string;
    date: string; // request_date
    status: string; // stage_id.name
    mechanic_id: number | false; // user_id
    client_id: number | false;
    vehicle_id: number | false;
    // Vehicle details from fleet.vehicle
    vehicle_brand?: string;
    vehicle_model?: string;
    vehicle_plate?: string;
}

// Vehículo: fleet.vehicle (Odoo) ↔ vehicle (Local)
export interface OdooVehicle {
    id: number;
    brand: string; // brand_id.name
    model: string; // model_id.name
    year: number; // model_year
    license_plate: string;
    vin: string; // vin_sn
    owner_id: number | false;
}

// Cita: mecatec.appointment (Odoo) ↔ appointment (Local)
export interface OdooAppointment {
    id: number;
    date: string;
    client_id: number | false;
    vehicle_id: number | false;
    reason: string;
    status: string;
}
