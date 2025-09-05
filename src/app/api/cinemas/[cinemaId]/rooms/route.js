import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cinema from "@/models/cinema";
import Room from "@/models/room";
import Seat from "@/models/seat";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { cinemaId } = params; // ✅ lấy trực tiếp
    const rooms = await Room.find({ cinema: cinemaId }).populate("seats");

    return NextResponse.json(rooms);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phòng:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { cinemaId } = params; // ✅ lấy trực tiếp
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Tên phòng không hợp lệ" }, { status: 400 });
    }

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return NextResponse.json({ error: "Cinema không tồn tại" }, { status: 404 });
    }

    const room = await Room.create({ name: name.trim(), cinema: cinemaId });
    return NextResponse.json(room);
  } catch (err) {
    console.error("Lỗi khi thêm phòng:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}  
