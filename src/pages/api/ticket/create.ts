import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket, statusTicketEnum, prioridadTicketEnum, client as clientSchema } from '@/db/schema';
import { type client, vehicle, type ticket as ticketType, vehicleIssue } from '@/db/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';


export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const {
      cedula,
      name,
      phone,
      vehicleDetails,
      issueType,
      issueDescription
    } = body;
    console.log('Datos recibidos:', body);
    // Validación básica
    if ( !name || !phone ) {
      return new Response(
        JSON.stringify({ error: 'Todos los campos son obligatorios.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener el userId del usuario autenticado
    const userId = locals?.user?.id || null;
    const vehicleID = randomUUID();
    await db.transaction(async (tx) => {
      let clientID: string;

      // Buscar si el cliente ya existe por la cedula
      let existingClientResult = await tx.select().from(clientSchema).where(
        eq(clientSchema.cedula, cedula)
      );
      const existingClient = existingClientResult[0] || null;

      if (existingClient) {
        // Si existe, usa su id
        clientID = existingClient.id;
      } else {
        clientID = randomUUID();
        await tx.insert(clientSchema).values({
          id: clientID,
          name: name,
          phone: phone,
          createdAt: new Date(),
          updatedAt: new Date(),
          email: undefined,
          address: undefined,
          cedula: cedula,
        } as typeof clientSchema.$inferInsert);
      }
      await tx.insert(vehicle).values({
        id: vehicleID,
        type: vehicleDetails.type,
        ownerId: clientID,
      });

      await tx.insert(vehicleIssue).values({
        id: randomUUID(),
        vehicleId: vehicleID,
        severity: 3,
        status: 'abierto',
        issueDescription: issueDescription,
        issueType: issueType,
      });

      await tx.insert(ticket).values({
        id: randomUUID(),
        vehicleId: vehicleID, // Placeholder value
        userId: userId,
        assignedTo: userId,
        clientId: clientID,
        status: statusTicketEnum.enumValues[0], // Asignar el primer valor del enum como estado inicial
        createdAt: new Date(),
        updatedAt: new Date(),
        short_description: issueDescription,
        priority: prioridadTicketEnum.enumValues[1], // Asignar el segundo valor del enum como prioridad inicial
      } as typeof ticket.$inferInsert);
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
