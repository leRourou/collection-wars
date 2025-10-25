import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      username?: string | null;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    username?: string | null;
    emailVerified?: Date | null;
  }
}
