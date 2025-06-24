import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Create a simple NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "asgardeo-login",
      name: "Asgardeo",
      credentials: {},
      async authorize() {
        // This function is just a placeholder - we'll redirect before it's called
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 