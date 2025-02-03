import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: number;
    name: string;
    email: string;
    token: string;
  }

  interface Session {
    user: {
      id: number;
      name: string;
      email: string;
      token: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name: string;
    email: string;
    accessToken: string;
  }
}
