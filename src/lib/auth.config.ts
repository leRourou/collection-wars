import type { NextAuthConfig } from "next-auth";

/**
 * Configuration Next-auth pour le middleware (Edge Runtime compatible)
 *
 * Ce fichier ne contient QUE la configuration sans les providers qui nécessitent Node.js
 * Il est utilisé par le middleware qui s'exécute sur Edge Runtime
 */
export const authConfig = {
  pages: {
    signIn: "/login",
    verifyRequest: "/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnProfile = nextUrl.pathname.startsWith("/profile");
      const isOnGame = nextUrl.pathname.startsWith("/game");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      // Routes protégées
      if (isOnDashboard || isOnProfile || isOnGame) {
        if (isLoggedIn) return true;
        return false; // Rediriger vers login
      }

      // Routes auth (login/register)
      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Providers ajoutés dans auth.ts
} satisfies NextAuthConfig;
