import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = [
  "/",
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
  "/api/library",
  "/api/billing/webhook",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC.includes(pathname) ||
    pathname.startsWith("/api/library") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon");
  if (isPublic) return NextResponse.next();
  const token = req.cookies.get("legalaid_session")?.value;
  if (!token) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
