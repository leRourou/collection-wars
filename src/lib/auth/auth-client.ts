"use client";

/**
 * Client-side auth exports from NextAuth
 * Ce fichier ré-exporte les fonctions NextAuth pour le client
 */

export type { Session } from "next-auth";
export { signIn, signOut, useSession } from "next-auth/react";
