import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import * as schema from "@/db/schema";

import { admin } from "better-auth/plugins"
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema: schema,
    }),
    emailAndPassword:{
        enabled: true,
    },
    plugins:[
        admin({
              defaultRole: "user",
                adminRoles: ["admin", "superadmin"],
              
        })
    ]
});
