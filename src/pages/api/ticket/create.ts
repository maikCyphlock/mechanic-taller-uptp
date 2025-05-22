import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
// Si tienes un esquema de tickets, impórtalo aquí
import { ticket } from '@/db/schema';
import { randomUUID } from 'crypto';

type Ticket = {
    name: string;
    phone: string;
    vehicleDetails: {
        type: string;
        [key: string]: any;
    };
    issueType: string;
    issueDescription: string;
    submissionDate?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body:Ticket = await request.json();
    const {
      name,
      phone,
      vehicleDetails,
      issueType,
      issueDescription,
      submissionDate
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

    await db.insert(ticket).values({
      id: randomUUID(),
      title: name,
      name,
      phone,
      vehicleType: vehicleDetails?.type || '',
      vehicleDetails: JSON.stringify(vehicleDetails),
      issueType,
      issueDescription,
      description: issueDescription,
      submissionDate: submissionDate ? new Date(submissionDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    });

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
