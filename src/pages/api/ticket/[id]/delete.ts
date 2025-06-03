import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { ticket } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ params , locals }) => {
  try {
    const ticketId = params.id;

    const isAdmin = locals?.user?.role === 'admin';

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

     const tickets = await db
      .update(ticket)
      .set({
        delete_at: new Date()
      })
      .where(eq(ticket.id, ticketId!));


    return new Response(
      JSON.stringify( tickets ),
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