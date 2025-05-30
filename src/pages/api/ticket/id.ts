import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket, client, vehicle, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async (request: Request, id: string) => {
  try {
    const ticketId = id;
    const tickets = await db
      .select({
        ticket: ticket, // todos los campos de ticket
        client: client, // todos los campos de client
        vehicle: vehicle, // todos los campos de vehicle
        user: user // campo "name" de user
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(user, eq(ticket.assignedTo, user.id))
      .where(eq(ticket.id, ticketId));

    console.log('All tickets fetched:', tickets);
    return new Response(
      JSON.stringify({ tickets }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST = async (request,id) => {
  try {
    const { clientId, vehicleId, assignedTo, description, status } = await request.json();
    const ticketId = id;

    const newTicket = await db.insert(ticket).values({
      id: ticketId,
      clientId,
      vehicleId,
      assignedTo,
      description,
      status,
      createdAt: new Date(), // Automatically set the creation date
      updatedAt: new Date(), // Automatically set the update date
    }).returning();

    console.log('New ticket created:', newTicket);
    return new Response(
      JSON.stringify({ ticket: newTicket }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
