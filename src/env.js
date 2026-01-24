import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    TURSO_TOKEN: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      (str) => process.env.VERCEL_URL ?? str,
      process.env.VERCEL ? z.string() : z.string().url(),
    ),
    // Data Provider Mode: 'local' uses PostgreSQL/SQLite, 'odoo' connects to Odoo backend
    DATA_PROVIDER: z.enum(["local", "odoo"]).default("local"),
    // Odoo configuration (only required when DATA_PROVIDER='odoo')
    ODOO_URL: z.string().url().optional(),
    ODOO_DB: z.string().optional(),
    ODOO_USERNAME: z.string().optional(),
    ODOO_PASSWORD: z.string().optional(),
  },
  client: {
    // Client-side environment variable to expose provider mode to frontend
    NEXT_PUBLIC_DATA_PROVIDER: z.enum(["local", "odoo"]).default("local"),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    TURSO_TOKEN: process.env.TURSO_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATA_PROVIDER: process.env.DATA_PROVIDER,
    ODOO_URL: process.env.ODOO_URL,
    ODOO_DB: process.env.ODOO_DB,
    ODOO_USERNAME: process.env.ODOO_USERNAME,
    ODOO_PASSWORD: process.env.ODOO_PASSWORD,
    NEXT_PUBLIC_DATA_PROVIDER: process.env.NEXT_PUBLIC_DATA_PROVIDER || process.env.DATA_PROVIDER,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});