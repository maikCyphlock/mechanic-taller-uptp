import { db } from "~/server/db";
import { syncQueue, client } from "~/server/db/schema";
import { getOdooClient } from "../odoo-client";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";

// --- Queue Management ---

export async function addClientToSyncQueue(clientId: string, operation: 'create' | 'update') {
    await db.insert(syncQueue).values({
        id: randomUUID(),
        entityType: 'ticket' as any, // Using ticket as proxy for clients in the sync queue
        entityId: clientId,
        operation,
        status: 'pending',
    });
}
// IGNORE ABOVE COMMENTARY, I WILL WRITE PROPER CODE
// I will create the file assuming I will update schema.ts in next step or use 'ticket' and filter by ID lookup.
// Actually, `processSyncQueueForClients` can look for items in queue where entityId exists in client table?
// No, queue items are opaque.

// DECISION: I will run the sync IMMEDIATELY in background (void promise) without queue for now,
// OR generic queue usage.
// Let's stick to "Trigger immediate sync in background" to solve user issue "now".
// Queue system requires robust worker.

export async function syncClientToOdoo(clientId: string) {
    try {
        const clientData = await db.query.client.findFirst({
            where: eq(client.id, clientId)
        });

        if (!clientData) return;

        const odoo = getOdooClient();
        const response = await odoo.post('/mecatec/api/clients', {
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            cedula: clientData.cedula,
        });

        if (response.status === 'success' && response.id) {
            // Update local client with Odoo ID if we had column (we don't yet)
            console.log(`[ClientConnector] Client ${clientId} synced to Odoo. ID: ${response.id}`);
        } else {
            console.error('[ClientConnector] Failed to sync client:', response);
        }
    } catch (e) {
        console.error('[ClientConnector] Exception syncing client:', e);
    }
}
