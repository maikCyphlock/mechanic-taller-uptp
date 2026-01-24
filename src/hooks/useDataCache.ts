/**
 * Hook for syncing and accessing data cached in IndexedDB
 * 
 * This is a client-side only hook that works with any data provider (local or Odoo).
 * Data is fetched from the unified API and stored in IndexedDB for fast access.
 * 
 * This hook replaces useOdooCache and is provider-agnostic.
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getClients, saveClients, updateSyncMeta, getSyncMeta,
    getBrands, saveBrands,
    getModels, saveModels,
    getVehicles, saveVehicles,
    getTickets, saveTickets,
    STORES,
    type CachedClient,
    type CachedBrand,
    type CachedModel,
    type CachedVehicle,
    type CachedTicket,
} from '~/lib/indexeddb/odoo-cache';

// Sync interval: 1 minute
const SYNC_INTERVAL_MS = 60 * 1000;

// Helper to check if we should sync
async function shouldSync(storeName: string): Promise<boolean> {
    const meta = await getSyncMeta(storeName);
    if (!meta) return true;
    return Date.now() - meta.lastSynced > SYNC_INTERVAL_MS;
}

// Unified API client
async function fetchFromAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`/api/data/${endpoint}`);
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${res.statusText}`);
    }
    return res.json();
}

async function postToAPI<T>(endpoint: string, data: any): Promise<T> {
    const res = await fetch(`/api/data/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API error: ${res.statusText}`);
    }
    return res.json();
}

// Fetch functions
async function fetchClients(): Promise<CachedClient[]> {
    try {
        return await fetchFromAPI<CachedClient[]>('clients');
    } catch (error) {
        console.error('[DataCache] Error fetching clients:', error);
        return [];
    }
}

async function fetchVehicles(): Promise<CachedVehicle[]> {
    try {
        const vehicles = await fetchFromAPI<any[]>('vehicles');
        return vehicles.map((v) => ({
            id: v.id,
            name: v.name || `${v.brand || ''} ${v.model || ''}`.trim(),
            license_plate: v.licensePlate,
            brand_name: v.brand,
            model_name: v.model,
            vin_sn: v.vin,
            model_year: v.year,
            odometer: v.odometer,
            transmission: v.transmission,
            owner: v.ownerId ? { id: v.ownerId, name: v.ownerName } : null,
        }));
    } catch (error) {
        console.error('[DataCache] Error fetching vehicles:', error);
        return [];
    }
}

async function fetchBrands(): Promise<CachedBrand[]> {
    try {
        return await fetchFromAPI<CachedBrand[]>('brands');
    } catch (error) {
        console.error('[DataCache] Error fetching brands:', error);
        return [];
    }
}

async function fetchModels(): Promise<CachedModel[]> {
    try {
        const models = await fetchFromAPI<any[]>('models');
        return models.map((m) => ({
            id: m.id,
            name: m.name,
            brand_id: m.brandId,
        }));
    } catch (error) {
        console.error('[DataCache] Error fetching models:', error);
        return [];
    }
}

async function fetchTickets(): Promise<CachedTicket[]> {
    try {
        return await fetchFromAPI<CachedTicket[]>('tickets');
    } catch (error) {
        console.error('[DataCache] Error fetching tickets:', error);
        return [];
    }
}

// Main hook
export function useDataCache() {
    const [clients, setClients] = useState<CachedClient[]>([]);
    const [vehicles, setVehicles] = useState<CachedVehicle[]>([]);
    const [brands, setBrands] = useState<CachedBrand[]>([]);
    const [models, setModels] = useState<CachedModel[]>([]);
    const [tickets, setTickets] = useState<CachedTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [providerName, setProviderName] = useState<string>('local');

    // Load from IndexedDB
    const loadFromCache = useCallback(async () => {
        try {
            const [cachedClients, cachedVehicles, cachedBrands, cachedModels, cachedTickets] = await Promise.all([
                getClients(),
                getVehicles(),
                getBrands(),
                getModels(),
                getTickets(),
            ]);
            setClients(cachedClients);
            setVehicles(cachedVehicles);
            setBrands(cachedBrands);
            setModels(cachedModels);
            setTickets(cachedTickets);
        } catch (err) {
            console.error('[DataCache] Failed to load from IndexedDB:', err);
        }
    }, []);

    // Sync from API
    const syncFromAPI = useCallback(async (force = false) => {
        setIsLoading(true);
        try {
            // Get provider status
            try {
                const status = await fetchFromAPI<{ providerName: string }>('status');
                setProviderName(status.providerName);
            } catch {
                // Ignore status errors
            }

            // Sync clients
            if (force || await shouldSync(STORES.CLIENTS)) {
                console.log('[DataCache] Syncing clients...');
                const apiClients = await fetchClients();
                if (apiClients.length > 0) {
                    await saveClients(apiClients);
                    await updateSyncMeta(STORES.CLIENTS);
                    setClients(apiClients);
                }
            }

            // Sync vehicles
            if (force || await shouldSync(STORES.VEHICLES)) {
                console.log('[DataCache] Syncing vehicles...');
                const apiVehicles = await fetchVehicles();
                if (apiVehicles.length > 0) {
                    await saveVehicles(apiVehicles);
                    await updateSyncMeta(STORES.VEHICLES);
                    setVehicles(apiVehicles);
                }
            }

            // Sync Brands
            if (force || await shouldSync(STORES.BRANDS)) {
                console.log('[DataCache] Syncing brands...');
                const apiBrands = await fetchBrands();
                if (apiBrands.length > 0) {
                    await saveBrands(apiBrands);
                    await updateSyncMeta(STORES.BRANDS);
                    setBrands(apiBrands);
                }
            }

            // Sync Models
            if (force || await shouldSync(STORES.MODELS)) {
                console.log('[DataCache] Syncing models...');
                const apiModels = await fetchModels();
                if (apiModels.length > 0) {
                    await saveModels(apiModels);
                    await updateSyncMeta(STORES.MODELS);
                    setModels(apiModels);
                }
            }

            // Sync Tickets
            if (force || await shouldSync(STORES.TICKETS)) {
                console.log('[DataCache] Syncing tickets...');
                const apiTickets = await fetchTickets();
                await saveTickets(apiTickets);
                await updateSyncMeta(STORES.TICKETS);
                setTickets(apiTickets);
            }

            setLastSynced(new Date());
        } catch (error) {
            console.error('[DataCache] Sync failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load: from cache first, then sync
    useEffect(() => {
        const init = async () => {
            await loadFromCache();
            await syncFromAPI();
        };
        init();

        // Listen for external sync triggers
        const channel = new BroadcastChannel('data-sync');
        channel.onmessage = (event) => {
            if (event.data === 'refresh') {
                console.log('[DataCache] Refreshing cache due to external trigger');
                void syncFromAPI(true);
            }
        };

        const interval = setInterval(() => {
            void syncFromAPI();
        }, 60 * 1000);

        return () => {
            clearInterval(interval);
            channel.close();
        };
    }, [loadFromCache, syncFromAPI]);

    // Search helpers
    const searchClients = useCallback((query: string): CachedClient[] => {
        if (!query || query.length < 2) return [];
        const lowerQuery = query.toLowerCase();
        return clients.filter(c =>
            c.name?.toLowerCase().includes(lowerQuery) ||
            c.vat?.includes(query) ||
            c.phone?.includes(query)
        ).slice(0, 10);
    }, [clients]);

    const searchBrands = useCallback((query: string): string[] => {
        if (!query) return brands.map(b => b.name);
        const lowerQuery = query.toLowerCase();
        return brands
            .filter(b => b.name.toLowerCase().includes(lowerQuery))
            .map(b => b.name);
    }, [brands]);

    const searchModels = useCallback((query: string, brandName?: string): string[] => {
        let filtered = models;

        if (brandName) {
            const brand = brands.find(b => b.name === brandName);
            if (brand) {
                filtered = models.filter(m => m.brand_id === brand.id);
            }
        }

        if (!query) return filtered.map(m => m.name);

        const lowerQuery = query.toLowerCase();
        return filtered
            .filter(m => m.name.toLowerCase().includes(lowerQuery))
            .map(m => m.name);
    }, [models, brands]);

    // Create functions
    const createClient = useCallback(async (data: { name: string; phone?: string; cedula?: string }) => {
        const newClient = await postToAPI<CachedClient>('clients', data);
        setClients(prev => [newClient, ...prev]);
        return newClient;
    }, []);

    const createVehicle = useCallback(async (data: { licensePlate: string; brand: string; model: string; ownerId?: string | number }) => {
        const newVehicle = await postToAPI<any>('vehicles', data);
        const cached: CachedVehicle = {
            id: newVehicle.id,
            name: newVehicle.name,
            license_plate: newVehicle.licensePlate,
            brand_name: newVehicle.brand,
            model_name: newVehicle.model,
        };
        setVehicles(prev => [cached, ...prev]);
        return newVehicle;
    }, []);

    const createTicket = useCallback(async (data: { title: string; description?: string; clientId: string | number; vehicleId: string | number }) => {
        const newTicket = await postToAPI<CachedTicket>('tickets', data);
        setTickets(prev => [newTicket, ...prev]);
        return newTicket;
    }, []);

    return {
        // Data
        clients,
        vehicles,
        brands,
        models,
        tickets,
        // Status
        isLoading,
        lastSynced,
        providerName,
        // Actions
        syncFromAPI,
        syncFromOdoo: syncFromAPI, // Alias for backward compatibility
        refresh: () => syncFromAPI(true),
        // Search helpers
        searchClients,
        searchBrands,
        searchModels,
        // Create functions
        createClient,
        createVehicle,
        createTicket,
    };
}

// Re-export for backwards compatibility
export { useDataCache as useOdooCache };
