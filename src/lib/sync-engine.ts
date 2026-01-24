import {
    addToQueue,
    getQueue,
    removeFromQueue,
    type SyncQueueItem,
    STORES
} from './indexeddb/odoo-cache';

export class SyncEngine {
    private isProcessing = false;
    private channel = typeof window !== 'undefined' ? new BroadcastChannel('odoo-sync') : null;

    // Add item to queue and trigger processing
    async enqueue(entity: SyncQueueItem['entity'], action: SyncQueueItem['action'], payload: any) {
        const item: SyncQueueItem = {
            id: crypto.randomUUID(),
            entity,
            action,
            payload,
            createdAt: Date.now(),
            retries: 0
        };
        await addToQueue(item);
        console.log(`[SyncEngine] Enqueued ${action} on ${entity}`, item);

        // Try to process immediately if online
        if (typeof navigator !== 'undefined' && navigator.onLine) {
            void this.processQueue();
        }
    }

    private idMap = new Map<string, number>(); // Temp UUID -> Real Odoo ID

    // Process all pending items
    async processQueue() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.idMap.clear(); // Clear map on new run (or keep if needed?) 
        // Ideally we should persist this map or rebuild it from cache if possible, but memory is good start.

        try {
            console.log('[SyncEngine] Processing queue...');
            const queue = await getQueue();
            if (queue.length === 0) {
                console.log('[SyncEngine] Queue empty.');
                return;
            }

            // Sort by creation time to ensure dependencies are processed first
            // (Client -> Vehicle -> Ticket)
            queue.sort((a, b) => a.createdAt - b.createdAt);

            for (const item of queue) {
                if (typeof navigator !== 'undefined' && !navigator.onLine) {
                    console.log('[SyncEngine] Offline. Pausing sync.');
                    break;
                }

                try {
                    // Resolve dependencies in payload
                    const resolvedPayload = this.resolvePayloadIds(item.payload);

                    const resultId = await this.syncItem(item.entity, item.action, resolvedPayload);

                    if (resultId) {
                        // Store mapping if the payload had a temp_id
                        if (item.payload.temp_id) {
                            this.idMap.set(item.payload.temp_id, resultId);
                            console.log(`[SyncEngine] Mapped ${item.payload.temp_id} -> ${resultId}`);
                        }

                        await removeFromQueue(item.id);
                        console.log(`[SyncEngine] Successfully synced item ${item.id}`);
                    } else {
                        console.warn(`[SyncEngine] Failed to sync item ${item.id}`);
                        // Break to prevent dependent items from failing? 
                        // Yes, if Client fails, Ticket will fail.
                        // But maybe we retry specific ones? simple break for now.
                        // break; 
                    }
                } catch (error) {
                    console.error(`[SyncEngine] Error processing item ${item.id}`, error);
                }
            }

            // Notify UI to refresh cache if anything was synced
            if (this.channel) {
                this.channel.postMessage('refresh');
                console.log('[SyncEngine] Notified UI to refresh cache');
            }
        } finally {
            this.isProcessing = false;
        }
    }

    private resolvePayloadIds(payload: any): any {
        const newPayload = { ...payload };

        // Check known dependency fields
        const keysToCheck = ['client_id', 'vehicle_id', 'owner_id', 'mechanic_id'];

        for (const key of keysToCheck) {
            if (newPayload[key] && typeof newPayload[key] === 'string' && this.idMap.has(newPayload[key])) {
                console.log(`[SyncEngine] Resolving ${key}: ${newPayload[key]} -> ${this.idMap.get(newPayload[key])}`);
                newPayload[key] = this.idMap.get(newPayload[key]);
            }
        }
        return newPayload;
    }

    private async syncItem(entity: string, action: string, payload: any): Promise<number | null> {
        let endpoint = '';
        let method = '';

        // Map entity/action to API endpoint
        switch (entity) {
            case 'client':
                endpoint = '/api/odoo/clients';
                break;
            case 'vehicle':
                endpoint = '/api/odoo/vehicles';
                break;
            case 'ticket':
                endpoint = '/api/odoo/tickets';
                break;
        }

        if (action === 'create') method = 'POST';

        if (!endpoint || !method) {
            return null;
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                console.error(`[SyncEngine] API Error: ${res.statusText}`);
                return null;
            }

            const responseData = await res.json();
            if (responseData.status === 'success' && responseData.id) {
                return responseData.id; // Return the new Odoo ID
            }
            return null;
        } catch (error) {
            console.error('[SyncEngine] Network Error', error);
            return null;
        }
    }
}

// Singleton instance
export const syncEngine = new SyncEngine();
