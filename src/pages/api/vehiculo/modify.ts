import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { vehicle } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const {
      id,
      plate,
      make,
      model,
      year,
      color,
      type,
      ownerId,
    } = body;

    // Validación de campos requeridos
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

    if (!plate || !make || !model) {
      return new Response(
        JSON.stringify({ error: 'Placa, marca y modelo son campos requeridos' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Verificar si el vehículo existe
    const existingVehicle = await db
      .select()
      .from(vehicle)
      .where(eq(vehicle.id, id));

    if (!existingVehicle.length) {
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

    // Actualizar el vehículo
    await db
      .update(vehicle)
      .set({
        plate,
        make,
        model,
        year,
        color,
        type,
        ownerId,
        updatedAt: new Date(),
      })
      .where(eq(vehicle.id, id));

    return new Response(
      JSON.stringify({ message: 'Vehículo actualizado exitosamente' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error al modificar vehículo:', error);
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
