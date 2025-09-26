import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { env } from "~/env";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Extender los tipos de NextAuth para incluir el campo 'action' en las credenciales
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      emailVerified: boolean;
      banned: boolean;
    } & DefaultSession["user"];
  }

  // El tipo User aquí se refiere al que devuelven los proveedores (ej. authorize)
  interface User {
    id: string; // Asegúrate de que el id esté aquí
    role: string;
    emailVerified: boolean;
    banned: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    emailVerified: boolean;
    banned: boolean;
    refreshedAt: number;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id ?? token.sub;
        session.user.role = token.role;
        session.user.banned = token.banned;
        session.user.emailVerified = token.emailVerified;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      const now = Date.now();
      const tokenMaxAge = 60 * 1000; // 1 minute

      // On sign-in, add initial data and timestamp
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.banned = user.banned;
        token.emailVerified = user.emailVerified;
        token.refreshedAt = now;
        return token;
      }

      // If token is stale, refresh it from the database
      if (token && now - (token.refreshedAt ?? 0) > tokenMaxAge) {
        const userId = token.id ?? token.sub;
        if (userId) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, userId as string),
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.banned = dbUser.banned;
            token.emailVerified = !!dbUser.emailVerified;
            token.name = dbUser.name;
            token.email = dbUser.email;
            token.refreshedAt = now; // Update the timestamp
          }
        }
      }

      return token;
    },
  },
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "credentials",
      // Definir los campos del formulario de inicio de sesión
      // 'credentials' se usa para generar un formulario de inicio de sesión genérico.
      // Como usamos nuestra propia página, podemos dejarlo vacío o definir los campos
      // que esperamos, pero no es estrictamente necesario para la lógica de 'authorize'.
      credentials: {
        // Estos campos se usan para generar un formulario de inicio de sesión por defecto.
        // Como usamos nuestro propio formulario, su definición aquí es más para claridad.
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { type: "hidden" },
      },
      async authorize(credentials) {
        console.log("\n--- Authorize Function Start ---");
        console.log("Received credentials:", { email: credentials?.email, name: credentials?.name, action: credentials?.action });

        if (!credentials) {
          console.log("No credentials received, returning null.");
          console.log("--- Authorize Function End ---\n");
          return null;
        }
        
        try {
          const { email, password, name, action } = credentials;

          const parsedCredentials = z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .safeParse({ email, password });

          if (!parsedCredentials.success) {
            console.log("Credential validation failed:", parsedCredentials.error.errors);
            console.log("--- Authorize Function End ---\n");
            return null;
          }
          console.log("Credential validation successful.");

          if (action === 'signup' && name) {
            console.log("Entering SIGNUP logic...");
            const existingUser = await db.query.users.findFirst({ where: eq(users.email, email) });

            if (existingUser) {
              console.log("User already exists.");
              throw new Error('User already exists');
            }
            console.log("User does not exist, proceeding with creation.");

            const hashedPassword = await bcrypt.hash(password, 12);
            const userId = crypto.randomUUID();
            
            console.log("Inserting new user into DB...");
            const [newUser] = await db.insert(users).values({
              id: userId,
              name: name.trim(),
              email: email.toLowerCase().trim(),
              password: hashedPassword,
              role: 'user',
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
              banned: false,
            }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });

            if (!newUser) {
              console.log("DB insert failed, newUser is undefined.");
              throw new Error('Failed to create user in database');
            }
            console.log("User created successfully:", newUser);

            const result = {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role || 'user',
              emailVerified: true,
              banned: false,
            };
            console.log("Returning new user object:", result);
            console.log("--- Authorize Function End ---\n");
            return result;
          }
          
          console.log("Entering SIGNIN logic...");
          const user = await db.query.users.findFirst({ where: eq(users.email, email) });

          if (!user) {
            console.log("Signin failed: User not found.");
            return null;
          }
          if (user.banned) {
            console.log("Signin failed: User is banned.");
            throw new Error('This account has been suspended');
          }

          const passwordsMatch = await bcrypt.compare(password, user.password || '');
          if (!passwordsMatch) {
            console.log("Signin failed: Passwords do not match.");
            return null;
          }

          console.log("Signin successful for user:", user.email);
          const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || 'user',
            emailVerified: !!user.emailVerified,
            banned: !!user.banned,
          };
          console.log("--- Authorize Function End ---\n");
          return result;

        } catch (error) {
          console.error('Critical error in authorize function:', error);
          console.log("--- Authorize Function End ---\n");
          // Re-throw para que NextAuth lo maneje
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
  },
  debug: env.NODE_ENV === "development",
};

export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};