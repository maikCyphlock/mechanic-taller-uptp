import { createTRPCRouter } from "~/server/api/trpc";
import { ticketRouter } from "./routers/ticket";
import { clientRouter } from "./routers/client";
import { vehicleRouter } from "./routers/vehicle";
import { userRouter } from "./routers/user";
import { vehicleIssueRouter } from "./routers/vehicleIssue";
import { roleRouter } from "./routers/role";

export const appRouter = createTRPCRouter({
  ticket: ticketRouter,
  client: clientRouter,
  vehicle: vehicleRouter,
  user: userRouter,
  vehicleIssue: vehicleIssueRouter,
  role: roleRouter,
});

export type AppRouter = typeof appRouter;