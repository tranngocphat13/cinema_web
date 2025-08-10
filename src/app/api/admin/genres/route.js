import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Genre from "@/models/genres.js";

// GET: Lấy danh sách thể loại
export async function GET() {
  await connectDB();
  const genres = await Genre.find().sort({ createdAt: -1 });
  return NextResponse.json(genres);
}

// POST: Thêm thể loại mới
export async function POST(req) {
  try {
    await connectDB();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Tên thể loại là bắt buộc" }, { status: 400 });
    }

    const exists = await Genre.findOne({ name });
    if (exists) {
      return NextResponse.json({ error: "Thể loại đã tồn tại" }, { status: 400 });
    }

    const genre = await Genre.create({ name });
    return NextResponse.json(genre);
  } catch {
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
