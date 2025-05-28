import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";
import { APIError } from "better-auth/api";

import {sequence} from "astro/middleware";


const PUBLIC_ROUTES = [
    "/signin",
    "/signup",
    "/api/auth",
];

export const onRequest = sequence(
    defineMiddleware(async (context, next) => {
        const currentPath = context.url.pathname;
        const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
    
        // If it's a public route, skip auth entirely
        if (isPublicRoute) {
            return next();
        }
    
        // Only fetch auth session for non-public routes
        let isAuthed;
        try {
            isAuthed = await auth.api.getSession({
                headers: context.request.headers,
            });
        } catch (err) {
            if (err instanceof APIError) {
                if (err.status === 401) {
                    return new Response(JSON.stringify({ error: "Authentication failed", message: err.message }), {
                        status: 401,
                        headers: { "Content-Type": "application/json" },
                    });
                } else if (typeof err.status === "number" && err.status >= 500) {
                    return new Response(JSON.stringify({ error: "Authentication service unavailable", message: err.message }), {
                        status: 503,
                        headers: { "Content-Type": "application/json" },
                    });
                } else {
                    return new Response(JSON.stringify({ error: "Authentication request failed", message: err.message }), {
                        status: typeof err.status === "number" ? err.status : 500,
                        headers: { "Content-Type": "application/json" },
                    });
                }
            } else {
                return new Response(JSON.stringify({ error: "Internal server error" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
    
        if (!isAuthed?.user?.email) {
            const signInUrl = new URL("/signin", context.url.origin).href;
            return context.redirect(signInUrl);
        }
    
        // Check if the user is banned
        if (isAuthed?.user?.banned) {
            return new Response(JSON.stringify({ error: "Banned" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
            });
        }
    
        // Strict admin path check
        if (/^\/admin(\/|$)/.test(currentPath)) {
            if (isAuthed?.user?.role !== "admin") {
                return new Response(JSON.stringify({ error: "Unauthorized" }), {
                    status: 401,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
    
        // Store auth info in context.locals for later use
        context.locals.user = isAuthed?.user ?? null;
        context.locals.session = isAuthed?.session ?? null;
    
        return next();
    })
)