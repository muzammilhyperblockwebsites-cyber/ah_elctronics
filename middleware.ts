import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, COOKIE_NAME } from "./lib/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  // 1. Whitelist admin login routes
  if (pathname === "/admin-login" || pathname === "/api/admin/login") {
    return NextResponse.next();
  }

  // 2. Protect all /admin pages
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const admin = token ? await verifyAdminToken(token) : null;

    if (!admin) {
      const loginUrl = new URL("/admin-login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect all /api/admin routes (except /api/admin/login)
  if (pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const admin = token ? await verifyAdminToken(token) : null;

    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
