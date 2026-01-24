/**
 * Unified Data API
 * 
 * This API endpoint works with any configured data provider (local or Odoo).
 * It provides a consistent interface for frontend components to interact with data.
 * 
 * Routes:
 * - GET/POST /api/data/clients
 * - GET /api/data/clients/[id]
 * - GET /api/data/clients/search?q=...
 * - GET/POST /api/data/vehicles
 * - GET /api/data/vehicles/[id]
 * - GET/POST /api/data/tickets
 * - GET /api/data/tickets/[id]
 * - GET /api/data/brands
 * - GET /api/data/models
 * - GET /api/data/status
 */

import { type NextApiRequest, type NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "~/server/auth";
import { getDataProvider, getDataProviderStatus, getDataProviderMode } from "~/lib/data-providers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verify authentication for non-public routes
    const session = await getServerSession(req, res, authOptions);

    const { action } = req.query;
    const actionPath = Array.isArray(action) ? action : [action];
    const [resource, ...params] = actionPath;

    console.log(`[DataAPI] ${req.method} /${actionPath.join('/')} - Mode: ${getDataProviderMode()}`);

    try {
        const provider = await getDataProvider();

        // Handle different resources
        switch (resource) {
            // =================================================================
            // Status
            // =================================================================
            case 'status':
                const status = await getDataProviderStatus();
                return res.json(status);

            // =================================================================
            // Clients
            // =================================================================
            case 'clients':
                if (params[0] === 'search') {
                    const query = req.query.q as string || '';
                    const clients = await provider.searchClients(query);
                    return res.json(clients);
                }

                if (params[0]) {
                    // GET /api/data/clients/[id]
                    const client = await provider.getClient(params[0]);
                    if (!client) {
                        return res.status(404).json({ error: 'Cliente no encontrado' });
                    }
                    return res.json(client);
                }

                if (req.method === 'GET') {
                    const clients = await provider.getClients();
                    return res.json(clients);
                }

                if (req.method === 'POST') {
                    if (!session) {
                        return res.status(401).json({ error: 'No autorizado' });
                    }
                    const newClient = await provider.createClient(req.body);
                    return res.status(201).json(newClient);
                }
                break;

            // =================================================================
            // Vehicles
            // =================================================================
            case 'vehicles':
                if (params[0]) {
                    // GET /api/data/vehicles/[id]
                    const vehicle = await provider.getVehicle(params[0]);
                    if (!vehicle) {
                        return res.status(404).json({ error: 'Vehículo no encontrado' });
                    }
                    return res.json(vehicle);
                }

                if (req.method === 'GET') {
                    const clientId = req.query.clientId as string;
                    if (clientId) {
                        const vehicles = await provider.getClientVehicles(clientId);
                        return res.json(vehicles);
                    }
                    const vehicles = await provider.getVehicles();
                    return res.json(vehicles);
                }

                if (req.method === 'POST') {
                    if (!session) {
                        return res.status(401).json({ error: 'No autorizado' });
                    }
                    const newVehicle = await provider.createVehicle(req.body);
                    return res.status(201).json(newVehicle);
                }
                break;

            // =================================================================
            // Tickets
            // =================================================================
            case 'tickets':
                if (params[0]) {
                    if (req.method === 'DELETE') {
                        if (!session) {
                            return res.status(401).json({ error: 'No autorizado' });
                        }
                        await provider.deleteTicket(params[0]);
                        return res.json({ success: true });
                    }

                    if (req.method === 'PUT' || req.method === 'PATCH') {
                        if (!session) {
                            return res.status(401).json({ error: 'No autorizado' });
                        }
                        const updated = await provider.updateTicket(params[0], req.body);
                        return res.json(updated);
                    }

                    // GET /api/data/tickets/[id]
                    const ticket = await provider.getTicket(params[0]);
                    if (!ticket) {
                        return res.status(404).json({ error: 'Ticket no encontrado' });
                    }
                    return res.json(ticket);
                }

                if (req.method === 'GET') {
                    const filters: any = {};
                    if (req.query.clientId) filters.clientId = req.query.clientId;
                    if (req.query.vehicleId) filters.vehicleId = req.query.vehicleId;
                    if (req.query.status) filters.status = req.query.status;

                    const tickets = await provider.getTickets(
                        Object.keys(filters).length > 0 ? filters : undefined
                    );
                    return res.json(tickets);
                }

                if (req.method === 'POST') {
                    if (!session) {
                        return res.status(401).json({ error: 'No autorizado' });
                    }
                    const newTicket = await provider.createTicket(req.body);
                    return res.status(201).json(newTicket);
                }
                break;

            // =================================================================
            // Reference Data
            // =================================================================
            case 'brands':
                const brands = await provider.getBrands();
                return res.json(brands);

            case 'models':
                const brandId = req.query.brandId ? Number(req.query.brandId) : undefined;
                const models = await provider.getModels(brandId);
                return res.json(models);

            default:
                return res.status(404).json({ error: `Recurso no encontrado: ${resource}` });
        }

        // Method not allowed for the resource
        return res.status(405).json({ error: 'Método no permitido' });

    } catch (error) {
        console.error('[DataAPI] Error:', error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : 'Error interno del servidor',
        });
    }
}
