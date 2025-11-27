// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type UserRole = "Admin" | "User" | string;

type AppToken = {
  role?: UserRole;
  // next-auth token còn có nhiều field khác, mình không cần khai báo hết
};

const LOGIN_PATH = "/login";

const PUBLIC_PATHS: readonly string[] = ["/", "/auth", "/login", "/about", "/contact", "/movies"];

// Match file tĩnh trong public: /logo.png, /images/a.jpg, /fonts/x.woff2, ...
const PUBLIC_FILE_REGEX = /\.(?:css|js|map|png|jpg|jpeg|gif|svg|ico|webp|avif|txt|xml|json|woff|woff2|ttf|eot)$/i;

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = url;

  // ✅ Bỏ qua hệ thống + file tĩnh
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    PUBLIC_FILE_REGEX.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ✅ Route công khai
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as AppToken | null;

  // ✅ Chưa đăng nhập -> về trang login (tránh loop vì LOGIN_PATH là public)
  if (!token) {
    url.pathname = LOGIN_PATH;
    url.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(url);
  }

  // ✅ Check role admin
  if (pathname.startsWith("/admin") && token.role !== "Admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Không áp dụng middleware cho API/auth + next static/image
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
