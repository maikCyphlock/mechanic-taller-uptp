import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket, client, vehicle, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get a single ticket by ID
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const ticketId = params.id;
    const sessionUser = locals?.user;

    if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const tickets = await db
      .select({
        ticket: ticket,
        client: client,
        vehicle: vehicle,
        user: user.name,
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(user, eq(ticket.assignedTo, user.id))
      .where(eq(ticket.id, ticketId!));

    const foundTicket = tickets[0];

    if (!foundTicket) {
        return new Response(JSON.stringify({ error: 'Ticket not found' }), { status: 404 });
    }

    // Optional: Check if the user is an admin or is assigned to the ticket
    const isAdmin = sessionUser.role === 'admin';
    const isAssigned = foundTicket.ticket.assignedTo === sessionUser.id;

    if (!isAdmin && !isAssigned) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    return new Response(JSON.stringify(foundTicket), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

// Update a ticket
export const PUT: APIRoute = async ({ params, request, locals }) => {
  const ticketId = params.id;
  const sessionUser = locals?.user;

  if (!sessionUser) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();

    // It's a good practice to whitelist the fields that can be updated.
    const { status, priority, assignedTo, ...rest } = body;
    const ticketDataToUpdate: { [key: string]: any } = {};

    if(status) ticketDataToUpdate.status = status;
    if(priority) ticketDataToUpdate.priority = priority;
    if(assignedTo) ticketDataToUpdate.assignedTo = assignedTo;

    // Here you could add more fields from the `rest` object if needed,
    // ensuring you don't allow updating sensitive fields.

    if (Object.keys(ticketDataToUpdate).length === 0) {
        return new Response(JSON.stringify({ error: 'No valid fields to update' }), { status: 400 });
    }

    // You might want to add a check here to ensure the user has permission to update the ticket
    // For example, only an admin or the assigned user can update it.

    const updatedTicket = await db
      .update(ticket)
      .set(ticketDataToUpdate)
      .where(eq(ticket.id, ticketId!))
      .returning();

    return new Response(JSON.stringify({ message: 'Ticket updated successfully', ticket: updatedTicket[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};

// Delete a ticket (soft delete)
export const DELETE: APIRoute = async ({ params, locals }) => {
  const ticketId = params.id;
  const sessionUser = locals?.user;

  if (!sessionUser || sessionUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    await db
      .update(ticket)
      .set({ delete_at: new Date() })
      .where(eq(ticket.id, ticketId!));

    return new Response(JSON.stringify({ message: 'Ticket deleted successfully' }), {
      status: 200,
    });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    });
  }
};
