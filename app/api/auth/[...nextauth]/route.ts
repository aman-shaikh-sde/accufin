// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const nextAuthHandler = NextAuth(authOptions);

export const GET = async (req: Request, ctx: any) => {
  console.log("nextauth GET start", req.url);
  const res = await nextAuthHandler(req as any, ctx as any);
  console.log("nextauth GET done", res.status);
  return res;
};

export const POST = async (req: Request, ctx: any) => {
  console.log("nextauth POST start", req.url);
  const res = await nextAuthHandler(req as any, ctx as any);
  console.log("nextauth POST done", res.status);
  return res;
};