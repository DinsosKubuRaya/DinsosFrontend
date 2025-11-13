import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const path = request.nextUrl.pathname;

  const publicPaths = ["/", "/login", "/register"];
  const isPublic = publicPaths.includes(path);

  //  Jika tidak ada token dan bukan public path → redirect ke login
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // login tapi akses login/register → redirect ke dashboard
  if (isPublic && token && path !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(svg|png|jpg|jpeg|webp)).*)",
  ],
};
