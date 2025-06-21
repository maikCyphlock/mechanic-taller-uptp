// Crear un archivo src/lib/db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { loadEnv } from "vite";
import * as Schema from "@/db/schema"



const { DATABASE_URL } = loadEnv(process.env.NODE_ENV!, process.cwd(), "");
// Crear el pool de conexiones
const pool = new Pool({
  connectionString: DATABASE_URL!,
});

// Crear y exportar la instancia de Drizzle
export const db = drizzle(pool, { schema: Schema});

// Exportar los operadores de Drizzle
export { eq, and, or, desc, asc } from 'drizzle-orm';

// Exportar los esquemas
export * from '../db/schema';