import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/signin"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export default auth((req) => {
  const { nextUrl } = req;
  if (isPublic(nextUrl.pathname)) return;
  if (req.auth) return;

  const url = nextUrl.clone();
  url.pathname = "/signin";
  url.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: [
    "/((?!api/auth|api/health|api/uploads|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
