import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { vehicle } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const vehicleRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(vehicle);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(vehicle)
        .where(eq(vehicle.id, input.id));

      return result[0];
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        plate: z.string().optional(),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        color: z.string().optional(),
        type: z.enum(["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      await ctx.db
        .update(vehicle)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(vehicle.id, id));

      return { success: true };
    }),
});