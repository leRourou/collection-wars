import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/nodemailer";
import { sendMagicLinkEmail } from "@/services/email-service";
import { prisma } from "../prisma";
import { authConfig } from "./auth.config";

/**
 * Configuration Next-auth avec EmailProvider (Node.js Runtime)
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
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({ email, url });
      },
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = user.username;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
});

export type { Session } from "next-auth";

import type { Session as NextAuthSession } from "next-auth";
export type User = NonNullable<NextAuthSession>["user"];
