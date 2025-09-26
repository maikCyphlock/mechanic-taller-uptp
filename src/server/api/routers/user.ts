import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(users);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.id));

      return result[0];
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        cedula: z.string().optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: any = {};

      if (input.name) updateData.name = input.name;
      if (input.phone) updateData.phone = input.phone;
      if (input.cedula) updateData.cedula = input.cedula;
      
      if (input.password) {
        updateData.password = await bcrypt.hash(input.password, 12);
      }

      await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, ctx.session.user.id));

      return { success: true };
    }),

  updateUser: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        role: z.enum(["user", "admin", "CLIENTE", "GERENTE", "OTRO", "SUPERADMIN"]).optional(),
        banned: z.boolean().optional(),
        banReason: z.string().optional(),
        banExpires: z.date().optional(),
        emailVerified: z.boolean().optional(),
        cedula: z.string().optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, password, ...updateData } = input;

      if (password) {
        updateData.password = await bcrypt.hash(password, 12);
      }

      await ctx.db
        .update(users)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id));

      return { success: true };
    }),
});