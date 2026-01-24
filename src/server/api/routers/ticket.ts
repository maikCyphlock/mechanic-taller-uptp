import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { ticket, client, vehicle, users } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { addVehicleToSyncQueue, processSyncQueueForVehicles } from "~/lib/odoo/connectors/vehicle-connector";

export const ticketRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        ticket,
        client,
        vehicle,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(users, eq(ticket.assignedTo, users.id));
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select({
          ticket,
          client,
          vehicle,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(ticket)
        .leftJoin(client, eq(ticket.clientId, client.id))
        .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
        .leftJoin(users, eq(ticket.assignedTo, users.id))
        .where(eq(ticket.id, input.id));

      return result[0];
    }),

  getMyTickets: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        ticket,
        client,
        vehicle,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(ticket)
      .leftJoin(client, eq(ticket.clientId, client.id))
      .leftJoin(vehicle, eq(ticket.vehicleId, vehicle.id))
      .leftJoin(users, eq(ticket.assignedTo, users.id))
      .where(eq(ticket.assignedTo, ctx.session.user.id));
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        phone: z.string(),
        cedula: z.string(),
        vehicleDetails: z.object({
          type: z.enum(["automovil", "camioneta", "camion", "motocicleta", "autobus", "otro"]),
          plate: z.string().optional(),
          make: z.string().optional(),
          model: z.string().optional(),
        }),
        issueType: z.string(),
        issueDescription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Trigger Odoo Sync for the new client (Fire and Forget)
      // Note: We use the clientId from inside the tx (but variable scope?). 
      // We need to capture clientId. It was defined inside tx.
      // Refactoring to return clientId from tx.

      // OR: simpler:
      // The clientId logic inside tx is complex.
      // Let's refactor the transaction to return values.
      const { ticketId: createdTicketId, vehicleId: createdVehicleId, clientId: finalClientId, isNewClient } = await ctx.db.transaction(async (tx) => {
        try {
          const vehicleId = randomUUID();
          const ticketId = randomUUID();
          // Check if client exists
          // Handle empty strings as null/undefined to check properly
          const cleanCedula = input.cedula?.trim() || null;

          let existingClient = null;

          if (cleanCedula) {
            existingClient = await tx.query.client.findFirst({
              where: eq(client.cedula, cleanCedula),
            });
          }

          let clientId: string;
          let isNewClient = false;

          if (existingClient) {
            clientId = existingClient.id;
            console.log(`[TicketCreate] Found existing client ${clientId} by cedula ${cleanCedula}`);
          } else {
            clientId = randomUUID();
            isNewClient = true;
            console.log(`[TicketCreate] Creating new client ${clientId} with cedula ${cleanCedula}`);

            await tx.insert(client).values({
              id: clientId,
              name: input.name,
              phone: input.phone || null,
              cedula: cleanCedula,
            });
          }

          // Create vehicle
          await tx.insert(vehicle).values({
            id: vehicleId,
            type: input.vehicleDetails.type,
            plate: input.vehicleDetails.plate || null,
            make: input.vehicleDetails.make,
            model: input.vehicleDetails.model,
            ownerId: clientId,
          });

          // Create ticket
          await tx.insert(ticket).values({
            id: ticketId,
            vehicleId,
            clientId,
            assignedTo: ctx.session.user.id,
            short_description: input.issueDescription,
            status: "ABIERTO",
            priority: "MEDIA",
          });

          return { ticketId, vehicleId, clientId, isNewClient };
        } catch (error) {
          console.error("Error in ticket creation transaction:", error);
          throw error;
        }
      });

      // Trigger Odoo Sync
      await addVehicleToSyncQueue(createdVehicleId, 'create');
      // Sync client if new (or always update? Let's sync if new for now)
      // We import syncClientToOdoo differently because it's void
      const { syncClientToOdoo } = await import("~/lib/odoo/connectors/client-connector");
      void syncClientToOdoo(finalClientId);

      void processSyncQueueForVehicles();

      return { success: true, ticketId: createdTicketId };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        status: z.enum(["ABIERTO", "EN_PROCESO", "CERRADO", "CANCELADO", "APROBADO"]).optional(),
        priority: z.enum(["BAJA", "MEDIA", "ALTA"]).optional(),
        time_spent: z.number().optional(),
        work_notes: z.string().optional(),
        tool_used: z.string().optional(),
        payment_method: z.enum(["EFECTIVO", "TARJETA_CREDITO", "TARJETA_DEBITO", "TRANSFERENCIA_BANCARIA", "PAGO_MOVIL", "OTRO"]).optional(),
        total_amount: z.number().optional(),
        payment_reference: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, total_amount, time_spent, ...rawUpdateData } = input;

      const updateData: Partial<typeof ticket.$inferInsert> = {
        ...rawUpdateData,
        updatedAt: new Date(),
      };

      if (typeof total_amount === "number") {
        updateData.total_amount = total_amount.toString();
      }

      if (typeof time_spent === "number") {
        updateData.time_spent = time_spent.toString();
      }

      await ctx.db
        .update(ticket)
        .set(updateData)
        .where(eq(ticket.id, id));

      return { success: true };
    }),

  approve: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["APROBADO", "CERRADO"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(ticket)
        .set({
          status: input.status,
          approved_by: ctx.session.user.id,
          approved_at: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ticket.id, input.id));

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(ticket)
        .set({
          delete_at: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(ticket.id, input.id));

      return { success: true };
    }),
});