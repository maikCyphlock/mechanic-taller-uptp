import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, status, priority, assignedTo } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Ticket ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const updatedTicket = await db
      .update(ticket)
      .set({ status, priority, assignedTo })
      .where(eq(ticket.id, id));

    return new Response(
      JSON.stringify({ message: 'Ticket updated successfully', updatedTicket }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating ticket:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};