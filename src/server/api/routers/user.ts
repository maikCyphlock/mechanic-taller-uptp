import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure, publicProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { logger } from "~/lib/logger";

export const userRouter = createTRPCRouter({

  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(users);
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1, { message: 'User ID is required' })
      })
    )
    .query(async ({ ctx, input }) => {
      const logContext = { 
        userId: ctx.session.user.id,
        targetUserId: input.id,
        action: 'getUserById' 
      };

      try {
        logger.debug(logContext, 'Fetching user by ID');
        
        const result = await ctx.db
          .select()
          .from(users)
          .where(eq(users.id, input.id))
          .limit(1);

        const user = result[0];
        
        if (!user) {
          logger.warn(logContext, 'User not found');
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Don't return sensitive data
        const { password: _, ...userWithoutPassword } = user;
        logger.debug({ ...logContext, user: userWithoutPassword }, 'Successfully fetched user');
        
        return userWithoutPassword;
        
      } catch (error) {
        if (error instanceof TRPCError) {
          logger.error({ ...logContext, error: error.message }, 'Failed to fetch user');
          throw error;
        }
        
        logger.error({ ...logContext, error }, 'Unexpected error in getById');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user',
          cause: error,
        });
      }
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
      const logContext = { 
        userId: ctx.session.user.id,
        action: 'updateProfile',
        updates: Object.keys(input).filter(key => key !== 'password')
      };

      try {
        logger.debug(logContext, 'Updating user profile');
        
        const updateData: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        if (input.name) updateData.name = input.name;
        if (input.phone) updateData.phone = input.phone;
        if (input.cedula) updateData.cedula = input.cedula;
        
        if (input.password) {
          updateData.password = await bcrypt.hash(input.password, 12);
          logContext.updates.push('password');
        }

        await ctx.db
          .update(users)
          .set(updateData)
          .where(eq(users.id, ctx.session.user.id));

        logger.info(logContext, 'User profile updated successfully');
        return { success: true };
        
      } catch (error) {
        logger.error({ ...logContext, error }, 'Failed to update user profile');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
          cause: error,
        });
      }
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
        emailVerified: z.union([z.boolean(), z.date()]).optional(),
        cedula: z.string().optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, emailVerified, password, ...updateData } = input;
      
      const logContext = { 
        adminId: ctx.session.user.id,
        targetUserId: id,
        action: 'updateUser',
        updates: Object.keys(updateData).filter(key => key !== 'password')
      };

      try {
        logger.debug(logContext, 'Admin updating user');
        
        const updatePayload: Record<string, unknown> = {
          ...updateData,
          updatedAt: new Date(),
        };

        // Handle emailVerified specially since it can be boolean or Date
        if (emailVerified !== undefined) {
          updatePayload.emailVerified = emailVerified === true ? new Date() : null;
          logContext.updates.push('emailVerified');
        }
        
        // Handle password hashing if provided
        if (password) {
          updatePayload.password = await bcrypt.hash(password, 12);
          logContext.updates.push('password');
        }
        
        // Perform the update
        await ctx.db.update(users)
          .set(updatePayload)
          .where(eq(users.id, id));

        logger.info(logContext, 'User updated successfully by admin');
        return { success: true };
        
      } catch (error) {
        logger.error({ ...logContext, error }, 'Failed to update user as admin');
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user',
          cause: error,
        });
      }
    }),
});