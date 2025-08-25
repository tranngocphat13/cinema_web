import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    if (!id) return NextResponse.json({ ok: false, error: "Thiếu id" }, { status: 400 });

    await Movie.findByIdAndDelete(id);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Xóa phim thất bại" }, { status: 500 });
  }
}
