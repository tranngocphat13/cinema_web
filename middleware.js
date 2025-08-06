// import { getToken } from "next-auth/jwt";
// import { NextResponse } from "next/server";

// export async function middleware(req) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   if (!token) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // Ví dụ chỉ cho Admin
//   if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "Admin") {
//     return NextResponse.redirect(new URL("/403", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"], // hoặc toàn bộ app
// };
