/**
 * IndexedDB Cache for Odoo Data
 * 
 * This module manages a local IndexedDB database in the browser
 * that caches data from Odoo for fast autocomplete and offline access.
 * Odoo is the single source of truth.
 */

const DB_NAME = 'odoo-cache';
const DB_VERSION = 2; // Incremented for schema update

// Store names
export const STORES = {
    CLIENTS: 'clients',
    VEHICLES: 'vehicles',
    BRANDS: 'brands',
    MODELS: 'models',
    TICKETS: 'tickets', // New
    SYNC_QUEUE: 'sync_queue', // New
    SYNC_META: 'sync_meta',
} as const;

// Types for cached data
export interface CachedClient {
    id: number; // Odoo ID
    name: string;
    email?: string;
    phone?: string;
    vat?: string;
    street?: string;
    city?: string;
    comment?: string;
}

export interface CachedTicket {
    id: number | string; // Odoo ID (number) or Temp ID (UUID string)
    name: string;
    description: string;
    request_date: string;
    stage_id: [number, string] | false;
    client_id: [number, string] | false;
    vehicle_id: [number, string] | false;
    is_synced?: boolean; // Local flag
}

export interface SyncQueueItem {
    id: string; // UUID
    entity: 'client' | 'vehicle' | 'ticket';
    action: 'create' | 'update' | 'delete';
    payload: any;
    createdAt: number;
    retries: number;
}

export interface CachedVehicle {
    id: number;
    name: string; // Display name in Odoo
    license_plate?: string;
    brand_id?: number;
    brand_name?: string;
    model_id?: number;
    model_name?: string;
    vin_sn?: string;
    model_year?: number;
    odometer?: number;
    transmission?: string;
    owner?: { id: number; name: string } | null;
}

export interface CachedBrand {
    id: number;
    name: string;
}

export interface CachedModel {
    id: number;
    name: string;
    brand_id: number;
}

export interface SyncMeta {
    store: string;
    lastSynced: number; // timestamp
}

// Open (or create) the database
function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
                const clientStore = db.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
                clientStore.createIndex('name', 'name', { unique: false });
                clientStore.createIndex('vat', 'vat', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.VEHICLES)) {
                const vehicleStore = db.createObjectStore(STORES.VEHICLES, { keyPath: 'id' });
                vehicleStore.createIndex('license_plate', 'license_plate', { unique: false });
                vehicleStore.createIndex('brand_name', 'brand_name', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.BRANDS)) {
                db.createObjectStore(STORES.BRANDS, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORES.MODELS)) {
                const modelStore = db.createObjectStore(STORES.MODELS, { keyPath: 'id' });
                modelStore.createIndex('brand_id', 'brand_id', { unique: false });
            }

            // New Stores
            if (!db.objectStoreNames.contains(STORES.TICKETS)) {
                const ticketStore = db.createObjectStore(STORES.TICKETS, { keyPath: 'id' });
                ticketStore.createIndex('client_id', 'client_id', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
                queueStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
                db.createObjectStore(STORES.SYNC_META, { keyPath: 'store' });
            }
        };
    });
}

// Generic: Get all items from a store
export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Generic: Put multiple items into a store (upsert)
export async function putManyInStore<T>(storeName: string, items: T[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        items.forEach(item => store.put(item));

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Generic: Put single item into a store
export async function putInStore<T>(storeName: string, item: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Generic: Replace items in a store (clear then put)
export async function replaceInStore<T>(storeName: string, items: T[]): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);

        // Clear first
        store.clear();

        // Then put all
        items.forEach(item => store.put(item));

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Generic: Clear a store
export async function clearStore(storeName: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Generic: Delete
export async function deleteFromStore(storeName: string, id: any): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Update sync metadata
export async function updateSyncMeta(storeName: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_META, 'readwrite');
        const store = tx.objectStore(STORES.SYNC_META);
        store.put({ store: storeName, lastSynced: Date.now() });

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

// Get sync metadata
export async function getSyncMeta(storeName: string): Promise<SyncMeta | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORES.SYNC_META, 'readonly');
        const store = tx.objectStore(STORES.SYNC_META);
        const request = store.get(storeName);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Convenience exports for specific stores
export const getClients = () => getAllFromStore<CachedClient>(STORES.CLIENTS);
export const getVehicles = () => getAllFromStore<CachedVehicle>(STORES.VEHICLES);
export const getBrands = () => getAllFromStore<CachedBrand>(STORES.BRANDS);
export const getModels = () => getAllFromStore<CachedModel>(STORES.MODELS);
export const getTickets = () => getAllFromStore<CachedTicket>(STORES.TICKETS);
export const getQueue = () => getAllFromStore<SyncQueueItem>(STORES.SYNC_QUEUE);

export const saveClients = (clients: CachedClient[]) => putManyInStore(STORES.CLIENTS, clients);
export const saveVehicles = (vehicles: CachedVehicle[]) => putManyInStore(STORES.VEHICLES, vehicles);
export const saveBrands = (brands: CachedBrand[]) => putManyInStore(STORES.BRANDS, brands);
export const saveModels = (models: CachedModel[]) => putManyInStore(STORES.MODELS, models);
export const saveTickets = (tickets: CachedTicket[]) => replaceInStore(STORES.TICKETS, tickets);

export const addToQueue = (item: SyncQueueItem) => putInStore(STORES.SYNC_QUEUE, item);
export const removeFromQueue = (id: string) => deleteFromStore(STORES.SYNC_QUEUE, id);

