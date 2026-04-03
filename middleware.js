import { NextResponse } from "next/server";

export function middleware(request) {
  const headers = new Headers(request.headers);
  const cookieHeader = headers.get("cookie") || "";
  const hasSessionCookie = /(?:^|;\s*)session=/.test(cookieHeader);
  const authHeader = headers.get("authorization") || "";

  if (!hasSessionCookie && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const mergedCookie = cookieHeader ? `${cookieHeader}; session=${token}` : `session=${token}`;
      headers.set("cookie", mergedCookie);
    }
  }

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  matcher: ["/api/masjidku/:path*"],
};
