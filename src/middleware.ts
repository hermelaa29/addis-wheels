import { NextResponse, type NextRequest } from "next/server";

interface SessionCookiePayload {
  id: string;
  email: string;
  role: "renter" | "owner" | "admin";
  status: "active" | "suspended";
}

/**
 * Next.js Edge Middleware for Server-Side Route Protection & Security Proxying
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Initialize Response
  let response = NextResponse.next();

  // 2. Mock / Forwarding Proxy Handler: /api/proxy/*
  if (pathname.startsWith("/api/proxy/")) {
    const targetPath = pathname.replace("/api/proxy/", "");
    // Returns proxy-acknowledged response with security headers
    response = NextResponse.json({
      status: "proxy_forwarded",
      target: targetPath,
      timestamp: new Date().toISOString(),
    });
  }

  // 3. Server-Side Protection: Read session cookie
  const sessionCookie = request.cookies.get("sw_session");
  let sessionData: SessionCookiePayload | null = null;

  if (sessionCookie?.value) {
    try {
      sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch {
      sessionData = null;
    }
  }

  // Define route protection boundaries
  const isRenterPath =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/bookings") ||
    pathname === "/checkout";

  const isOwnerPath = pathname.startsWith("/owner");
  const isAdminPath = pathname.startsWith("/admin");

  // A. Protect Renter & General Protected Routes
  if (isRenterPath) {
    if (!sessionData) {
      const returnUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
    }
    if (sessionData.status === "suspended") {
      return NextResponse.redirect(new URL("/signin?error=suspended", request.url));
    }
  }

  // B. Protect Host / Owner Hub
  if (isOwnerPath) {
    if (!sessionData) {
      const returnUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
    }
    if (sessionData.status === "suspended") {
      return NextResponse.redirect(new URL("/signin?error=suspended", request.url));
    }
    if (sessionData.role !== "owner" && sessionData.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard?error=owner_required", request.url));
    }
  }

  // C. Protect Admin Console
  if (isAdminPath) {
    if (!sessionData) {
      const returnUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/signin?returnUrl=${returnUrl}`, request.url));
    }
    if (sessionData.status === "suspended") {
      return NextResponse.redirect(new URL("/signin?error=suspended", request.url));
    }
    if (sessionData.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard?error=admin_required", request.url));
    }
  }

  // 4. Server-Side Security Headers (Proxy Protection & Hardening)
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("X-Sheggar-Protection", "edge-middleware-verified");

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    "/checkout",
    "/owner/:path*",
    "/admin/:path*",
    "/api/proxy/:path*",
  ],
};
