import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket, client, vehicle, user, statusTicketEnum, prioridadTicketEnum, client as clientSchema, vehicleIssue } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const sessionUser = locals?.user;
    if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const isAdmin = sessionUser.role === 'admin';
    let tickets;

    const query = db
      .select({
        ticket: ticket,
        client: client,
        vehicle: vehicle,
        user: user.name
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(user, eq(ticket.assignedTo, user.id));

    if (isAdmin) {
      tickets = await query;
    } else {
      tickets = await query.where(eq(ticket.assignedTo, sessionUser.id));
    }

    return new Response(JSON.stringify({ tickets }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const {
      cedula,
      name,
      phone,
      vehicleDetails,
      issueType,
      issueDescription,
    } = body;

    if (!name || !phone) {
      return new Response(JSON.stringify({ error: 'Todos los campos son obligatorios.' }), {
        status: 400,
      });
    }

    const userId = locals?.user?.id || null;
    const vehicleID = randomUUID();

    await db.transaction(async (tx) => {
      let clientID: string;

      const existingClientResult = await tx.select().from(clientSchema).where(eq(clientSchema.cedula, cedula));
      const existingClient = existingClientResult[0] || null;

      if (existingClient) {
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
        });
      }

      await tx.insert(vehicle).values({
        id: vehicleID,
        type: vehicleDetails.type,
        ownerId: clientID,
        plate: vehicleDetails.plate,
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
        vehicleId: vehicleID,
        userId: userId,
        assignedTo: userId,
        clientId: clientID,
        status: statusTicketEnum.enumValues[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        short_description: issueDescription,
        priority: prioridadTicketEnum.enumValues[1],
      });
    });

    return new Response(JSON.stringify({ message: 'Ticket creado exitosamente.' }), {
      status: 201,
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor.' }), {
      status: 500,
    });
  }
};
