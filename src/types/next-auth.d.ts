import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      image?: string;
      fullName?: string;
      country?: string;
      language?: string;
      role?:string;
    };
  }

  interface User {
    id: string;
    email: string;
    image?: string;
    fullName?: string;
    country?: string;
    language?: string;
    role?:string;
  }
}