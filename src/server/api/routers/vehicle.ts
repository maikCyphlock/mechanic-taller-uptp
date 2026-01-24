import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { vehicle } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { addVehicleToSyncQueue, processSyncQueueForVehicles } from "~/lib/odoo/connectors/vehicle-connector";
import { nanoid } from "nanoid";

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

  getBrands: protectedProcedure.query(async ({ ctx }) => {
    // Basic implementation: get all and distinct via JS if groupBy is tricky with current driver
    // Or try groupBy if supported
    const allVehicles = await ctx.db
      .select({ make: vehicle.make })
      .from(vehicle);

    // Extract unique non-empty makes
    const makes = new Set(allVehicles.map(v => v.make).filter(Boolean));
    return Array.from(makes).sort();
  }),

  getModels: protectedProcedure
    .input(z.object({ brand: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const { eq, and, isNotNull, ne } = await import("drizzle-orm");

      let query = ctx.db
        .select({ model: vehicle.model })
        .from(vehicle)
        .where(isNotNull(vehicle.model));

      if (input.brand) {
        query = ctx.db
          .select({ model: vehicle.model })
          .from(vehicle)
          .where(and(isNotNull(vehicle.model), eq(vehicle.make, input.brand)));
      }

      const results = await query;
      const models = new Set(results.map(v => v.model).filter(Boolean));
      return Array.from(models).sort();
    }),

  create: adminProcedure
    .input(
      z.object({
        plate: z.string().optional(),
        make: z.string().optional(),
        model: z.string().optional(),
        year: z.number().optional(),
        color: z.string().optional(),
        type: z.enum(["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"]).default("otro"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const id = nanoid();
      await ctx.db.insert(vehicle).values({
        id,
        ...input,
      });

      // Trigger Odoo Sync
      await addVehicleToSyncQueue(id, "create");
      void processSyncQueueForVehicles();

      return { success: true, id };
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