import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { AuthOptions } from "next-auth";
import prisma from "./prisma";

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Database query timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

async function validateUserCredentials(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();

  const user = await withTimeout(
    prisma.user.findFirst({
      where: {
        email: {
          equals: cleanEmail,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isActive: true,
        password: true,
      },
    }),
    15000
  );

  if (!user) {
    throw new Error("No account found with this email");
  }

  if (user.isActive === false) {
    throw new Error("Your account is inactive. Please contact support.");
  }

  if (!user.password) {
    throw new Error("No password set. Please reset your password.");
  }

  const isValid = await compare(password, user.password);

  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return user;
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
          throw new Error("Please enter both email and password");
        }

        const user = await validateUserCredentials(
          credentials.email,
          credentials.password
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name || "",
          isAdmin: user.isAdmin,
          isActive: user.isActive,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      if ((user as any).isActive === false) {
        return false; 
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.isAdmin = (user as any).isAdmin;
        token.email = user.email;
      }
      return token;
    },

   
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", 
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
    updateAge: 30 * 24 * 60 * 60, 
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, 
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: false, 
};