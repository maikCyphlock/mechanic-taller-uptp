import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { vehicle } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(
                JSON.stringify({ error: 'ID del vehículo es requerido' }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

        const vehicles = await db
            .select()
            .from(vehicle)
            .where(eq(vehicle.id, id));

        if (!vehicles.length) {
            return new Response(
                JSON.stringify({ error: 'Vehículo no encontrado' }),
                {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
        }

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
        console.error('Error al obtener vehículo:', error);
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