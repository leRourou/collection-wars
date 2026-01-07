import { auth } from "@/lib/auth/auth";

/**
 * Middleware Next.js avec NextAuth 5.0
 * Le callback authorized() de authConfig s'exécute automatiquement
 */
export default auth((req) => {
  // NextAuth gère automatiquement les redirections via le callback authorized()
  // défini dans auth.config.ts
});

/**
 * Matcher configuration. Sert pour optimiser les performances.
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
