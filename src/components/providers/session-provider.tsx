"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import type { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
  session?: Session | null;
}

/**
 * Wrapper pour le SessionProvider de Next-auth
 * Permet d'accéder à la session dans tous les Client Components
 *
 * Best practice: Utiliser ce provider au plus haut niveau possible
 * pour minimiser les Client Components boundaries
 */
export function SessionProvider({ children, session }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
