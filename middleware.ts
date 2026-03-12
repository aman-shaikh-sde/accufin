// middleware.ts (root)

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { JWT } from "next-auth/jwt";

type AppJWT = JWT & {
  isAdmin?: boolean;
  isActive?: boolean;
};

export default withAuth(
  function middleware(req: NextRequest & { nextauth: { token: AppJWT | null } }) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (token?.isActive === false) {
      const url = new URL("/login", req.url);
      url.searchParams.set("inactive", "1");
      const response = NextResponse.redirect(url);
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");
      return response;
    }

    if (pathname.startsWith("/admin") && !token?.isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => {
        if (!token) return false;
        if (typeof token.id !== "string" || !token.id) return false;
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};