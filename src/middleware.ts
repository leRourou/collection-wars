import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware Next.js
 * Actuellement désactivé (pass-through) pour éviter les conflits avec NextAuth
 */
export function middleware(_: NextRequest) {
  return NextResponse.next();
}

/**
 * Matcher configuration. Sert pour optimiser les performances.
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
