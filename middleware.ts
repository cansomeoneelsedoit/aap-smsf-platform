import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const STAFF_PREFIXES = [
  "/dashboard",
  "/clients",
  "/companies",
  "/preparation",
  "/compliance",
  "/lodgement",
  "/kyc",
  "/users",
  "/notifications",
  "/audit-log",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!getSessionCookie(request);

  const isStaffRoute = STAFF_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isPortalRoute =
    pathname.startsWith("/portal") &&
    !pathname.startsWith("/portal/login");

  if (isStaffRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isPortalRoute && !hasSession) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/companies/:path*",
    "/preparation/:path*",
    "/compliance/:path*",
    "/lodgement/:path*",
    "/kyc/:path*",
    "/users/:path*",
    "/notifications/:path*",
    "/audit-log/:path*",
    "/portal/:path*",
  ],
};
