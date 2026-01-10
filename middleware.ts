import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const { pathname } = req.nextUrl;

        // 1. Mandatory Onboarding Check
        if (isAuth && !token.onboardingComplete && token.role !== "admin") {
            // NEVER redirect API routes or static files to a UI page - this causes "Unexpected token <" errors
            const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.webmanifest', '.txt'];
            if (pathname.startsWith("/api/") || staticExtensions.some(ext => pathname.endsWith(ext))) {
                return NextResponse.next();
            }

            // For UI pages, redirect if not on /onboarding
            if (pathname !== "/onboarding") {
                return NextResponse.redirect(new URL("/onboarding", req.url));
            }
        }

        // 2. Prevent accessing /onboarding if already complete
        if (isAuth && token.onboardingComplete && pathname === "/onboarding") {
            return NextResponse.redirect(new URL("/discover", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // 1. Always allow static files and PWA manifests
                const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.webmanifest', '.txt'];
                if (staticExtensions.some(ext => pathname.endsWith(ext))) {
                    return true;
                }

                // 2. Public routes that don't need auth
                const publicRoutes = ["/", "/login", "/register", "/contact", "/cookies", "/privacy", "/terms", "/guidelines", "/about"];
                const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route + "/"));

                if (isPublic) return true;

                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
