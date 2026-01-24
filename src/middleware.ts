import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Public routes
        if (pathname.startsWith("/auth/") || pathname === "/") {
          return true;
        }

        // Protected routes require authentication
        if (!token) {
          return false;
        }

        const role = token.role as string;

        // Admin routes require admin or manager role
        if (pathname.startsWith("/admin")) {
          return role === "admin" || role === "manager"; // Admin gets full access, Manager gets most
        }

        // Mechanic routes
        if (pathname.startsWith("/mechanic")) {
          return role === "mechanic" || role === "admin" || role === "manager";
        }

        // User/Client routes
        if (pathname.startsWith("/user") || pathname.startsWith("/client")) {
          // Generally anyone logged in can be a 'user' but 'client' specific features might need check
          return true;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};