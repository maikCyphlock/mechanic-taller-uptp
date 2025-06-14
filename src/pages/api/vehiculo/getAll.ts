import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { vehicle } from '@/db/schema';
import { desc } from 'drizzle-orm';

export const GET: APIRoute = async () => {
    try {
        const vehicles = await db.select().from(vehicle).orderBy(desc(vehicle.createdAt));

        return new Response(
            JSON.stringify(vehicles),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (error) {
        console.error('Error al obtener vehículos:', error);
        return new Response(
            JSON.stringify({ error: 'Error interno del servidor' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
};

export const prerender = false; 