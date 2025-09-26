import { initTRPC, TRPCError } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { type Session } from "next-auth";
import superjson from "superjson";
import { ZodError } from "zod";

import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

type CreateContextOptions = {
  session: Session | null;
};

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    db,
  };
};

export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;

  // Get the session from the request
  const session = await getServerAuthSession({ req, res });

  // Log the session for debugging
  console.log('TRPC Context - Session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    role: session?.user?.role
  });

  return createInnerTRPCContext({
    session,
  });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        code: shape.data.code,
        httpStatus: shape.data.httpStatus,
        path: 'path' in error ? (error as { path?: string }).path : undefined,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ ctx, next }) => {
  console.log('enforceUserIsAuthed - Session:', ctx.session);
  
  if (!ctx.session?.user) {
    console.log('enforceUserIsAuthed - No user in session, throwing UNAUTHORIZED');
    throw new TRPCError({ 
      code: "UNAUTHORIZED",
      message: 'You must be logged in to access this resource'
    });
  }
  
  return next({
    ctx: {
      // Infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  const allowedRoles = ["admin", "SUPERADMIN"];
  if (
    !ctx.session?.user?.role ||
    !allowedRoles.includes(ctx.session.user.role)
  ) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({
    ctx: {
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
export const adminProcedure = t.procedure.use(enforceUserIsAdmin);