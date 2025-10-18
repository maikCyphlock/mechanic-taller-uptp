import { type NextApiRequest, type NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";

const signupSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const { name, email, password } = signupSchema.parse(req.body);

    // Verificar si el usuario ya existe
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado" });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generar ID único para el usuario
    const userId = crypto.randomUUID();

    // Crear el usuario
    await db.insert(users).values({
      id: userId,
      name,
      email,
      password: hashedPassword,
      emailVerified: null,
      role: "user",
      banned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: userId,
        name,
        email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
    }

    console.error("Error al crear usuario:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
