import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { client } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const clientRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(client);
  }),

  getAllLite: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: client.id,
        name: client.name,
        cedula: client.cedula,
        phone: client.phone,
      })
      .from(client);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(client)
        .where(eq(client.id, input.id));

      return result[0];
    }),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!input.query) return [];

      const { or, like } = await import("drizzle-orm");

      // Use like for partial matching
      return await ctx.db
        .select()
        .from(client)
        .where(
          or(
            like(client.name, `%${input.query}%`),
            like(client.cedula, `%${input.query}%`)
          )
        )
        .limit(10);
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        cedula: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(client)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(client.id, id));

      return { success: true };
    }),
});