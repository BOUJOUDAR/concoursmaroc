import { type NextRequest } from "next/server";
import { i18n, isValidLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip admin, api, static files
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return;
  }

  // Check if locale is in URL
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${i18n.defaultLocale}${pathname}`;
  return Response.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|robots.txt|sitemap.xml).*)"],
};
