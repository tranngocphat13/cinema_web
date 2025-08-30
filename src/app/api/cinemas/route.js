import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cinema from "@/models/cinema";

// GET: Lấy danh sách rạp
export async function GET() {
  try {
    await connectDB();
    const cinemas = await Cinema.find();
    return NextResponse.json(cinemas, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Thêm rạp mới
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: "Thiếu tên hoặc địa chỉ rạp" },
        { status: 400 }
      );
    }

    const cinema = await Cinema.create(body);
    return NextResponse.json(cinema, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
