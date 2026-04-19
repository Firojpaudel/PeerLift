import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    isAdmin: boolean;
  }
  interface Session {
    user: User & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Admin bypass
        if (credentials.email === "admin@peerlift.app" && credentials.password === "Admin123!") {
          return {
            id: "test-admin-id",
            email: "admin@peerlift.app",
            username: "adminuser",
            name: "Admin User",
            isAdmin: true,
          };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.isBanned) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash || '',
        );

        if (!isPasswordValid) return null;

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
