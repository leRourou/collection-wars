import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Configuration NextAuth pour le middleware (Edge Runtime)
 * N'inclut PAS les providers qui nécessitent Node.js (nodemailer)
 */
export const { auth } = NextAuth(authConfig);
