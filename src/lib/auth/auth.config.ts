import type { NextAuthConfig } from "next-auth";

/**
 * Configuration Next-auth pour le middleware (Edge Runtime compatible)
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
      const isOnLobby = nextUrl.pathname.startsWith("/lobby");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      // IMPORTANT: Toujours autoriser les routes API NextAuth
      // Le matcher exclut déjà /api/auth, mais on double-check ici
      if (nextUrl.pathname.startsWith("/api/auth")) {
        return true;
      }

      // Routes protégées
      if (isOnDashboard || isOnProfile || isOnGame || isOnLobby) {
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
  providers: [],
} satisfies NextAuthConfig;
