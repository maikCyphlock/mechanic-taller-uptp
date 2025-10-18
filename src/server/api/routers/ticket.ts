import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { ticket, client, vehicle, users } from "~/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

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
        }),
        issueType: z.string(),
        issueDescription: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const vehicleId = randomUUID();
      const ticketId = randomUUID();

      await ctx.db.transaction(async (tx) => {
        // Check if client exists
        let existingClient = await tx.query.client.findFirst({
          where: eq(client.cedula, input.cedula),
        });

        let clientId: string;
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          clientId = randomUUID();
          await tx.insert(client).values({
            id: clientId,
            name: input.name,
            phone: input.phone,
            cedula: input.cedula,
          });
        }

        // Create vehicle
        await tx.insert(vehicle).values({
          id: vehicleId,
          type: input.vehicleDetails.type,
          plate: input.vehicleDetails.plate,
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
      });

      return { success: true, ticketId };
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