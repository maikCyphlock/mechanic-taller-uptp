import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket, client, vehicle, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ locals }) => {
  try {
    const isAdmin = locals?.user?.role === 'admin';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const tickets = await db
      .select({
        ticket: ticket, // todos los campos de ticket
        client: client, // todos los campos de client
        vehicle: vehicle, // todos los campos de vehicle
        user: user.name // todos los campos de user
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(user, eq(ticket.assignedTo, user.id));

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