"use client";

/**
 * Client-side auth exports from NextAuth
 * Ce fichier ré-exporte les fonctions NextAuth pour le client
 *
 * IMPORTANT: Ce fichier doit avoir la directive "use client"
 * car il sera utilisé dans les composants client
 */

export { useSession, signIn, signOut } from "next-auth/react";
export type { Session } from "next-auth";
