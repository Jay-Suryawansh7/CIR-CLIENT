// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Matchers
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAuthRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // 0) Auth pages must remain public and unmodified
  if (isAuthRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims as any)?.metadata?.role;

  // 1) Protect admin routes
  if (isAdminRoute(req)) {
    // Signed in and admin → allow
    if (userId && role === "admin") {
      return NextResponse.next();
    }

    // Signed in but not admin → send home with flag
    if (userId && role !== "admin") {
      const url = new URL("/", req.url);
      url.searchParams.set("admin", "denied");
      return NextResponse.redirect(url);
    }

    // Not signed in → go to sign-in and preserve intent
    const url = new URL("/sign-in", req.url);
    url.searchParams.set("redirect_url", "/admin");
    return NextResponse.redirect(url);
  }

  // 2) Convenience: admin visiting "/" → auto-route to /admin
  if (req.nextUrl.pathname === "/" && userId && role === "admin") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // 3) Everything else
  return NextResponse.next();
});

// Apply to all routes except Next internals and static assets
export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:css|js|map|ico|png|jpg|jpeg|gif|svg|webp|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
};
