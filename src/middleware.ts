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
        
        // Admin routes require admin role
        if (pathname.startsWith("/admin/")) {
          return token.role === "admin";
        }
        
        // User routes require email verification
        if (pathname.startsWith("/user/")) {
          return !!token.emailVerified;
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