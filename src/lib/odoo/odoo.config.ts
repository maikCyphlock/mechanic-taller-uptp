import type { OdooCredentials, SyncConfig } from './sync-types';

/**
 * Configuración de Odoo desde variables de entorno
 */
export function getOdooCredentials(): OdooCredentials {
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

/**
 * Configuración de sincronización desde variables de entorno
 */
export function getSyncConfig(): SyncConfig {
    return {
        enabled: process.env.ODOO_SYNC_ENABLED === 'true',
        autoSyncEnabled: process.env.ODOO_AUTO_SYNC_ENABLED === 'true',
        syncIntervalMinutes: parseInt(process.env.ODOO_SYNC_INTERVAL_MINUTES || '15', 10),
        retryAttempts: parseInt(process.env.ODOO_RETRY_ATTEMPTS || '3', 10),
        timeoutMs: parseInt(process.env.ODOO_TIMEOUT_MS || '10000', 10),
    };
}

/**
 * Verificar si la sincronización está habilitada
 */
export function isSyncEnabled(): boolean {
    return process.env.ODOO_SYNC_ENABLED === 'true';
}

/**
 * Rutas de la API de Odoo
 */
export const ODOO_API_ROUTES = {
    inventory: '/mecatec/api/inventory',
    maintenance: '/mecatec/api/maintenance',
    vehicle: '/mecatec/api/vehicle',
    appointment: '/mecatec/api/appointment',
} as const;
