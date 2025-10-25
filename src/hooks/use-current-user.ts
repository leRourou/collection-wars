"use client";

import { useSession } from "next-auth/react";

/**
 * Hook pour accéder rapidement à l'utilisateur courant
 * Retourne l'objet user depuis la session
 *
 * @example
 * const user = useCurrentUser();
 * if (user) {
 *   console.log(user.email);
 * }
 */
export function useCurrentUser() {
  const { data: session } = useSession();
  return session?.user;
}

/**
 * Hook pour vérifier si l'utilisateur est authentifié
 *
 * @example
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) {
 *   router.push('/login');
 * }
 */
export function useIsAuthenticated() {
  const { data: session, status } = useSession();
  return status === "authenticated" && !!session;
}
