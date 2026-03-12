import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth handler
 * Exported directly for GET and POST to avoid stream issues
 * in production environments (Docker / EC2 / serverless).
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };