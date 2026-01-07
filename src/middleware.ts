export { auth as default } from "@/lib/auth/auth.edge";

/**
 * Matcher configuration. Sert pour optimiser les performances.
 */
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
