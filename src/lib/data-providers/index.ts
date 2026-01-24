/**
 * Data Provider Index
 * 
 * Factory function and exports for the data provider abstraction layer.
 * Use getDataProvider() to get the appropriate provider based on environment config.
 */

import type { DataProvider } from './data-provider';
import type { DataProviderMode } from './types';

// Re-export all types
export * from './types';
export type { DataProvider } from './data-provider';

// =============================================================================
// Configuration
// =============================================================================

/**
 * Get the configured data provider mode from environment
 */
export function getDataProviderMode(): DataProviderMode {
    const mode = process.env.DATA_PROVIDER || 'local';
    if (mode !== 'local' && mode !== 'odoo') {
        console.warn(`[DataProvider] Invalid DATA_PROVIDER value: ${mode}. Defaulting to 'local'`);
        return 'local';
    }
    return mode;
}

/**
 * Check if the application is running in Odoo mode
 */
export function isOdooMode(): boolean {
    return getDataProviderMode() === 'odoo';
}

/**
 * Check if the application is running in local mode
 */
export function isLocalMode(): boolean {
    return getDataProviderMode() === 'local';
}

// =============================================================================
// Provider Factory
// =============================================================================

let providerInstance: DataProvider | null = null;

/**
 * Get the singleton instance of the configured data provider.
 * 
 * Based on the DATA_PROVIDER environment variable:
 * - 'local': Uses LocalDataProvider (PostgreSQL/SQLite via Drizzle)
 * - 'odoo': Uses OdooDataProvider (connects to Odoo backend)
 */
export async function getDataProvider(): Promise<DataProvider> {
    if (!providerInstance) {
        const mode = getDataProviderMode();

        console.log(`[DataProvider] Initializing provider in '${mode}' mode`);

        try {
            if (mode === 'odoo') {
                // Use dynamic import() for ESM compatibility
                const mod = await import('./odoo-provider');
                const OdooClass = mod.OdooDataProvider || mod.default || mod;
                providerInstance = new OdooClass();
            } else {
                const mod = await import('./local-provider');
                const LocalClass = mod.LocalDataProvider || mod.default || mod;
                providerInstance = new LocalClass();
            }
        } catch (error) {
            console.error(`[DataProvider] Failed to load ${mode} provider:`, error);
            throw error;
        }
    }

    return providerInstance!;
}

/**
 * Reset the provider instance. Useful for testing or switching modes.
 */
export function resetDataProvider(): void {
    providerInstance = null;
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Check if the current data source is available
 */
export async function isDataSourceAvailable(): Promise<boolean> {
    try {
        const provider = await getDataProvider();
        return await provider.isAvailable();
    } catch (error) {
        console.error('[DataProvider] Error checking availability:', error);
        return false;
    }
}

/**
 * Get status information about the current data provider
 */
export async function getDataProviderStatus() {
    try {
        const provider = await getDataProvider();
        return await provider.getStatus();
    } catch (error) {
        return {
            available: false,
            providerName: getDataProviderMode(),
            message: error instanceof Error ? error.message : 'Error desconocido',
        };
    }
}
