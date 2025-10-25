import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware Next.js
 *
 * Note: Avec une stratégie de session "database", nous ne pouvons pas vérifier
 * l'authentification dans le middleware (Edge Runtime).
 * La protection des routes se fait au niveau des pages/layouts avec auth()
 */
export function middleware(request: NextRequest) {
  // Le middleware peut gérer d'autres logiques (redirections, headers, etc.)
  // mais pas l'authentification avec database sessions
  return NextResponse.next();
}

/**
 * Matcher configuration pour optimiser les performances
 * Le middleware ne s'exécutera que sur les routes spécifiées
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
