import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = path.startsWith("/admin") || path.startsWith("/api/admin");
  const isPublicApiRoute = path.startsWith("/api/donations") || path.startsWith("/api/upload") || path.startsWith("/api/auth");

  if (isProtectedRoute) {
    const session = await verifySession();
    
    if (!session) {
      if (path.startsWith("/api/")) {
        return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
