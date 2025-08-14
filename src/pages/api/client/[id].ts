import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { client } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Get a single client by ID
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'Client ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const clientFound = await db.select().from(client).where(eq(client.id, id));

    if (clientFound.length === 0) {
      return new Response(JSON.stringify({ error: 'Client not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(clientFound[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Update a client
export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'Client ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const body = await request.json();
    const { name, email, phone, state, cedula, city, address } = body;

    const updateData: { [key: string]: any } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (state) updateData.state = state;
    if (cedula) updateData.cedula = cedula;
    if (city) updateData.city = city;
    if (address) updateData.address = address;

    const updatedClient = await db
      .update(client)
      .set(updateData)
      .where(eq(client.id, id))
      .returning();

    return new Response(
      JSON.stringify({ message: 'Client updated successfully', client: updatedClient[0] }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating client:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
