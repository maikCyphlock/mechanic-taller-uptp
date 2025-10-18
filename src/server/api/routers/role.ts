import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "~/server/api/trpc";
import { role } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const roleRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(role);
  }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(role)
        .where(eq(role.id, input.id));

      return result[0];
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(role).values({
        id: randomUUID(),
        name: input.name,
        description: input.description,
      }).returning();
      return result[0];
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(role)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(role.id, id));

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(role)
        .where(eq(role.id, input.id));

      return { success: true };
    }),
});
