import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
// Si tienes un esquema de tickets, impórtalo aquí
import {  vehicle } from '@/db/schema';

import { randomUUID } from 'crypto';
import { client } from 'drizzle/schema';


export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const {
      plate,
      make,
      model,
      year,
      color,
      type,
      clientId,
      name,
    } = body;
    console.log('Datos recibidos:', body);
    // Validación básica
    if (!name || !phone || !vehicleDetails || !issueType || !issueDescription) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el userId del usuario autenticado
    const userId = locals?.user?.id || null;


    await db.insert(vehicle).values({
      id: randomUUID(),
      plate: plate,
      make: make,
      model: model,
      year: year,
      color: color,
      ownerId: clientId,
      type: type,
      createdAt: new Date(),
      updatedAt: new Date(),

    }
    );

    // Simulación de éxito
    return new Response(
      JSON.stringify({ message: 'Ticket creado exitosamente.' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const prerender = false;
