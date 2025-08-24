// app/api/movies/sync/route.js
import { NextResponse } from "next/server";
import { syncMovies } from "@/lib/syncMovies";

export async function GET() {
  try {
    await syncMovies();
    return NextResponse.json({ message: "Đồng bộ thành công!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi đồng bộ" }, { status: 500 });
  }
}
