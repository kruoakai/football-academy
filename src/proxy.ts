import { NextResponse } from "next/server";
import { auth } from "@/auth";

const protectedPrefixes = ["/dashboard", "/coach", "/pay", "/admin", "/api/reports"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/coach/:path*", "/pay/:path*", "/admin/:path*", "/api/reports/:path*"],
};
