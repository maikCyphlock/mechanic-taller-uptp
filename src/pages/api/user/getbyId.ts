// src/pages/api/client/all.ts

import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('id');

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Se requiere el ID del usuario' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .execute();

    const userData = result[0];

    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(userData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const POST:APIRoute = async ({ request }) => {
  try {
    const res = await  request.json()
   
    const userId = res?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Se requiere el ID del usuario' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
 

    const userData = result[0];
 
    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'Usuario no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(userData),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error al obtener el usuario por ID:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};