import type { APIRoute } from 'astro';
import { db } from '@/lib/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import type { InferInsertModel } from 'drizzle-orm';

type UserInsert = InferInsertModel<typeof user>;

// Get a single user by ID
export const GET: APIRoute = async ({ params }) => {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userFound = await db.select().from(user).where(eq(user.id, id));

    if (userFound.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(userFound[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// Update a user
export const PUT: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const body = await request.json();
    const { password, ...userData } = body;

    // Update user personal data
    if (Object.keys(userData).length > 0) {
        const updateData: Partial<UserInsert> = {};
        if (userData.name) updateData.name = userData.name;
        if (userData.email) updateData.email = userData.email;
        if (userData.phone) updateData.phone = userData.phone;
        if (userData.role) updateData.role = userData.role;
        if (userData.banned !== undefined) updateData.banned = userData.banned;
        if (userData.banReason) updateData.banReason = userData.banReason;
        if (userData.banExpires) updateData.banExpires = new Date(userData.banExpires);
        if (userData.cedula) updateData.cedula = userData.cedula;
        if (userData.emailVerified !== undefined) updateData.emailVerified = userData.emailVerified;
        if (userData.image) updateData.image = userData.image;

        await db
            .update(user)
            .set(updateData)
            .where(eq(user.id, id));
    }

    // Update password if provided
    if (password) {
        if(password.trim() == '') return
        const ctx = await auth.$context;
        const hashedPassword = await ctx.password.hash(password);

        await db.update(account).set({
            password: hashedPassword
        }).where(and(
            eq(account.userId, id),
            eq(account.providerId, 'credential')
        ));
    }

    return new Response(
      JSON.stringify({ message: 'Usuario actualizado correctamente' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el usuario', details: errorMessage }),
      { status: 500 }
    );
  }
};
