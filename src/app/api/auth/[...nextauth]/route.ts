import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            user_password: credentials?.password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.status) {
          return {
            id: data.user.user_id,
            email: data.user.email,
            name: `${data.user.firstname} ${data.user.lastname}`,
            token: data.token,
          };
        }
        throw new Error(data.message || "Invalid credentials");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        token.email = user.email;
        token.name = user.name;
        token.accessToken = user.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          name: token.name,
          token: token.accessToken,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET, // เปลี่ยนเป็น secret จริงของคุณ
});

export { handler as GET, handler as POST };
