// lib/auth.ts

import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import type { AuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import prisma from "./prisma";

const SESSION_MAX_AGE = 8 * 60 * 60;
const SESSION_UPDATE_AGE = 60 * 60;

interface AuthUser extends User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
}

async function validateCredentials(
  email: string,
  password: string
): Promise<AuthUser> {
  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findFirst({
    where: { email: { equals: cleanEmail, mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      isAdmin: true,
      isActive: true,
      password: true,
    },
  });

  if (!user) {
    throw new Error("Incorrect email or password.");
  }

  if (!user.isActive) {
    throw new Error("INACTIVE_ACCOUNT");
  }

  if (!user.password) {
    throw new Error("No password set for this account. Please reset your password.");
  }

  const passwordMatch = await compare(password, user.password);
  if (!passwordMatch) {
    throw new Error("Incorrect email or password.");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    isAdmin: user.isAdmin ?? false,
    isActive: user.isActive,
  };
}

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.");
        }
        return validateCredentials(credentials.email, credentials.password);
      },
    }),

    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: { prompt: "select_account" },
            },
          }),
        ]
      : []),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await prisma.user.findFirst({
            where: {
              email: { equals: user.email.toLowerCase(), mode: "insensitive" },
            },
            select: { id: true, isActive: true, isAdmin: true, name: true },
          });

          if (!dbUser) return "/login?error=no_account";
          if (!dbUser.isActive) return "/login?inactive=1";

          const u = user as AuthUser;
          u.id = dbUser.id;
          u.isAdmin = dbUser.isAdmin ?? false;
          u.isActive = dbUser.isActive;
          u.name = dbUser.name ?? user.name ?? "";

          return true;
        } catch {
          return false;
        }
      }

      return false;
    },

    async jwt({ token, user, trigger, session: updatePayload }): Promise<JWT> {
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        token.email = u.email ?? "";
        token.name = u.name ?? "";
        token.isAdmin = u.isAdmin ?? false;
        token.isActive = u.isActive ?? true;
      }

      if (trigger === "update" && updatePayload) {
        if (typeof updatePayload.name === "string") token.name = updatePayload.name;
        if (typeof updatePayload.isActive === "boolean") token.isActive = updatePayload.isActive;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = (token.name as string) ?? "";
        session.user.isAdmin = token.isAdmin as boolean;
        session.user.isActive = token.isActive as boolean;
      }
      return session;
    },
  },

  events: {
    async signOut() {},
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },

  jwt: {
    maxAge: SESSION_MAX_AGE,
  },

  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  debug: false,
};
