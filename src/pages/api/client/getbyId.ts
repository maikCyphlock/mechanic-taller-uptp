import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { client } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { 
      id, 
  } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'client ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const clientfound = await db
      .select()
      .from(client)
      .where(eq(client.id, id));

    return new Response(
      JSON.stringify( clientfound ),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching client:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};