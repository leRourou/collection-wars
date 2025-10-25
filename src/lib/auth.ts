import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import EmailProvider from "next-auth/providers/nodemailer";
import CredentialsProvider from "next-auth/providers/credentials";
import { sendMagicLinkEmail } from "@/services/email";
import { authConfig } from "./auth.config";

/**
 * Configuration Next-auth avec EmailProvider (Node.js Runtime)
 * Ce fichier contient les providers et adapters qui nécessitent Node.js
 * La configuration pour Edge Runtime est dans auth.config.ts
 *
 * Best practice: Séparer la config pour éviter les erreurs Edge Runtime
 */
export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_SERVER_HOST,
        port: Number(process.env.SMTP_SERVER_PORT),
        auth: {
          user: process.env.SMTP_SERVER_USER,
          pass: process.env.SMTP_SERVER_PASSWORD,
        },
        secure: process.env.SMTP_SERVER_SECURE === "true",
      },
      from: process.env.SMTP_FROM,
      // Durée de validité du lien magique (24 heures)
      maxAge: 24 * 60 * 60,
      // Template d'email personnalisé
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({ email, url });
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user }) {
      // Ajouter l'ID utilisateur à la session
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

/**
 * Type helpers pour récupérer les types de session et utilisateur
 */
export type { Session } from "next-auth";
import type { Session as NextAuthSession } from "next-auth";
export type User = NonNullable<NextAuthSession>["user"];
