import { createTRPCRouter } from "~/server/api/trpc";
import { ticketRouter } from "./routers/ticket";
import { clientRouter } from "./routers/client";
import { vehicleRouter } from "./routers/vehicle";
import { userRouter } from "./routers/user";
import { vehicleIssueRouter } from "./routers/vehicleIssue";
import { roleRouter } from "./routers/role";
import { syncRouter } from "./routers/sync";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  clients: clientRouter, // Renombrado para evitar conflicto con método built-in 'client'
  vehicle: vehicleRouter,
  user: userRouter,
  vehicleIssue: vehicleIssueRouter,
  role: roleRouter,
  sync: syncRouter,
});

export type AppRouter = typeof appRouter;