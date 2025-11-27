import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // Các route public không cần đăng nhập
  const publicPaths = ["/", "/auth", "/about", "/contact", "/movies"];

  // Bỏ qua các route hệ thống
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Cho phép truy cập nếu route công khai
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  // Lấy token từ cookie (next-auth)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Nếu chưa đăng nhập, redirect về /login
  if (!token) {
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // Kiểm tra role user
  const userRole = token.role;

  // Nếu truy cập admin mà không phải Admin => redirect về trang chủ
  if (pathname.startsWith("/admin") && userRole !== "Admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Cho phép các trường hợp còn lại
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
