import { handlers } from "@/lib/auth";

// Force Node.js runtime pour supporter nodemailer et EmailProvider
export const runtime = "nodejs";

export const { GET, POST } = handlers;
