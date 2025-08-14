import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { vehicle } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get a single vehicle by ID
export const GET: APIRoute = async ({ params }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID del vehículo es requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const vehicles = await db.select().from(vehicle).where(eq(vehicle.id, id));
        if (!vehicles.length) {
            return new Response(JSON.stringify({ error: 'Vehículo no encontrado' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        return new Response(JSON.stringify(vehicles[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al obtener vehículo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Update a vehicle
export const PUT: APIRoute = async ({ params, request }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID del vehículo es requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await request.json();
        const { plate, make, model, year, color, type, ownerId } = body;

        if (!plate || !make || !model) {
            return new Response(JSON.stringify({ error: 'Placa, marca y modelo son campos requeridos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        await db.update(vehicle)
            .set({ plate, make, model, year, color, type, ownerId, updatedAt: new Date() })
            .where(eq(vehicle.id, id));

        return new Response(JSON.stringify({ message: 'Vehículo actualizado exitosamente' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al modificar vehículo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

// Delete a vehicle
export const DELETE: APIRoute = async ({ params }) => {
    const { id } = params;
    if (!id) {
        return new Response(JSON.stringify({ error: 'ID del vehículo es requerido' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        await db.delete(vehicle).where(eq(vehicle.id, id));
        return new Response(JSON.stringify({ message: 'Vehículo eliminado exitosamente' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error al eliminar vehículo:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};

export const prerender = false;
