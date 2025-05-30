// src/pages/api/user/modify.ts
import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';
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

// src/pages/api/user/modify.ts
export const getUserById = async (userId: string, context: any) => {
    try {
      const session = await auth.api.getSession({
        headers: context.request.headers,
      });
  
      if (!session?.user) {
        return new Response(
          JSON.stringify({ error: 'No autorizado' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
  
      // Reemplazar auth.api.getUser con el método correcto de tu API de autenticación
      // Opción 1: Si usas una base de datos directamente
      // const user = await db.user.findUnique({ where: { id: userId } });
      
      // Opción 2: Si usas la sesión actual (si es el mismo usuario)
      const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .execute();

    // Tomar el primer resultado (asumiendo que el ID es único)
    const userData = result[0];
      
      // Opción 3: Si usas un servicio de usuarios
      // const user = await userService.getUserById(userId);
  
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
      console.error('Error getting user:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Error al obtener el usuario',
          details: error.message 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };

export const PUT: APIRoute = async ({ request }) => {
  try {
    const res = await request.json();

    const { id, name, email, phone, role, banned, banReason, banExpires, cedula, emailVerified, image } = res;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Construir el objeto de actualización dinámicamente
    const updateData: Partial<typeof user> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (role) updateData.role = role;
    if (banned !== undefined) updateData.banned = banned;
    if (banReason) updateData.banReason = banReason;
    if (banExpires) updateData.banExpires = new Date(banExpires);
    if (cedula) updateData.cedula = cedula;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;
    if (image) updateData.image = image;

    // Actualizar el usuario en la base de datos
    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();

    return new Response(
      JSON.stringify({ message: 'Usuario actualizado correctamente', updatedUser }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ error: 'Error al actualizar el usuario' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// API endpoint handler
export const post: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { userId, ...updateData } = data;
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'ID de usuario no proporcionado' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return await updateUser(userId, updateData, { request });
  } catch (error) {
    console.error('Error in API route:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error en el servidor',
        details: error.message 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// Handle other HTTP methods
export const all: APIRoute = ({ request }) => {
  return new Response(
    JSON.stringify({ error: 'Método no permitido' }),
    { status: 405, headers: { 'Content-Type': 'application/json' } }
  );
};