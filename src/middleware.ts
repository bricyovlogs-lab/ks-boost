import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session-token";

const ADMIN_PATHS = ["/admin"];
const PARTNER_PATHS = ["/influencer"];
const AUTH_PATHS = ["/dashboard", "/success"];

function hasPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
      "connect-src 'self' https://api.stripe.com https://checkout.stripe.com",
      "font-src 'self' data:",
      "base-uri 'self'",
      "form-action 'self' https://checkout.stripe.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")
  );
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("vks_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAdminPath = hasPrefix(pathname, ADMIN_PATHS);
  const isPartnerPath = hasPrefix(pathname, PARTNER_PATHS);
  const isAuthPath = hasPrefix(pathname, AUTH_PATHS);

  if ((isAdminPath || isPartnerPath || isAuthPath) && !session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(url));
  }

  if (isAdminPath && session?.role !== "ADMIN") {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (isPartnerPath && session && !["ADMIN", "AFFILIATE", "RESELLER"].includes(session.role)) {
    return applySecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|api/stripe/webhook).*)",
  ],
};
