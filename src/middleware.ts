import { auth } from "@/lib/auth";
import { defineMiddleware } from "astro:middleware";



const PUBLIC_ROUTES = [
    "/signin",
    "/signup",
    "/api/auth",
];

export const onRequest = defineMiddleware(async (context, next) => {
    let isAuthed;
    try {
        isAuthed = await auth.api.getSession({
            headers: context.request.headers,
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }

    // check if the user is banned
    if (isAuthed?.user?.banned) {
        return new Response(JSON.stringify({ error: "Banned" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
        });
    }

    const currentPath = context.url.pathname;
    const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
   

    if (!isAuthed?.user && !isPublicRoute) {
        const signInUrl = new URL("/signin", context.url.origin).href;
        return context.redirect(signInUrl);
    }

    // Strict admin path check
    if (/^\/admin(\/|$)/.test(context.url.pathname)) {
        if (isAuthed?.user?.role !== "admin") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }
    }

    context.locals.user = isAuthed?.user ?? null;
    context.locals.session = isAuthed?.session ?? null;

    return next();
});