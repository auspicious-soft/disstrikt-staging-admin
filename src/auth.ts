import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials: any) => {
        if (credentials.email) {
          // Check for email instead of username
          return {
            id: credentials._id || "",
            email: credentials.email,
            fullName: credentials.fullName || "",
            image: credentials.image || "",
            country: credentials.country || "",
            language: credentials.language || "",
            role: credentials.role,
          };
        } else {
          const error = new Error("Invalid credentials");
          error.name = "CredentialsSignin";
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
       token.id = user.id || "";
      token.email = user.email || "";
      token.fullName = user.fullName || "";
      token.image = user.image || "";
      token.country = user.country || "";
      token.role = user.role || "";
      token.language = user.language || "";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session as any).user.fullName = token.fullName;
        (session as any).user.email = token.email;
        (session as any).user.image = token.image;
        (session as any).user.role = token.role;
        (session as any).user.country = token.country;
        (session as any).user.language = token.language;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
  },
});
