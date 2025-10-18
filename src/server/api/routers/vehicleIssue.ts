import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { vehicleIssue } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const vehicleIssueRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(vehicleIssue);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(vehicleIssue)
        .where(eq(vehicleIssue.id, input.id));

      return result[0];
    }),

  getByVehicleId: protectedProcedure
    .input(z.object({ vehicleId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db
        .select()
        .from(vehicleIssue)
        .where(eq(vehicleIssue.vehicleId, input.vehicleId));
    }),

  create: protectedProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        description: z.string(),
        severity: z.number().min(1).max(10),
        status: z.string(),
        issueDescription: z.string().optional(),
        issueType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.insert(vehicleIssue).values({
        id: randomUUID(),
        ...input,
      }).returning();
      return result[0];
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        severity: z.number().min(1).max(10).optional(),
        status: z.string().optional(),
        issueDescription: z.string().optional(),
        issueType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(vehicleIssue)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(vehicleIssue.id, id));

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(vehicleIssue)
        .set({
          delete_at: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vehicleIssue.id, input.id));

      return { success: true };
    }),
});
