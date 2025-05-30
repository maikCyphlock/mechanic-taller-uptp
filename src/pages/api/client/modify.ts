import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { client } from '@/db/schema';
import { eq } from 'drizzle-orm';
interface UpdateData {
  name?: string;
  email?: string;
  phone?: string;
  state?: string;
  cedula?: string;
  city?: string;
  address?: string;
}
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { 
      id, 
      name,
    email,
    phone,
    state,
    cedula,
    city,
    address
  } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'client ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const updateData:UpdateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (state) updateData.state = state;
    if (cedula) updateData.cedula = cedula;
    if (city) updateData.city = city;
    if (address) updateData.address = address;

    const updatedclient = await db
      .update(client)
      .set(updateData)
      .where(eq(client.id, id));

    return new Response(
      JSON.stringify({ message: 'client updated successfully', updatedclient }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating client:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};