// src/pages/api/user/modify.ts


import { user } from '@/db/schema';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  banned?: boolean;
}

export const PUT = async ({ request }) => {
  const { userId, userData } = await request.json();

  try {
    // Asegúrate de que los valores de tipo timestamp sean objetos Date válidos
    if (userData.createdAt && typeof userData.createdAt !== 'object') {
      userData.createdAt = new Date(userData.createdAt);
    }
    if (userData.updatedAt && typeof userData.updatedAt !== 'object') {
      userData.updatedAt = new Date(userData.updatedAt);
    }

    const [updatedUser] = await db
      .update(user)
      .set(userData)
      .where(eq(user.id, userId))
      .returning();

    return new Response(
      JSON.stringify(updatedUser),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al actualizar el usuario',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};


