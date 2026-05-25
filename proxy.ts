import { NextResponse, type NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

/**
 * Next.js 16 Proxy (formerly Middleware). PRD §6.4 / §6.5 access control.
 * Hanya melakukan optimistic check dari cookie. Authorization real dilakukan di DAL.
 */

const SESSION_COOKIE = "otp_session";

const PUBLIC_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/pricing",
  "/docs",
  "/products",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
]);

function isProtected(path: string): "client" | "admin" | null {
  if (path.startsWith("/dashboard")) return "client";
  if (path.startsWith("/admin")) return "admin";
  return null;
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const guard = isProtected(path);
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decryptSession(token);

  // Belum login, akses protected → redirect ke /login
  if (guard && !session) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // Salah role
  if (guard === "client" && session && session.role !== "client") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }
  if (guard === "admin" && session && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Sudah login + akses /login atau /register → redirect ke dashboard sesuai role
  if (session && (path === "/login" || path === "/register")) {
    const target = session.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(target, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (handled per-handler)
     * - _next static / image / favicon / public assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

// silence unused warning
void PUBLIC_ROUTES;
