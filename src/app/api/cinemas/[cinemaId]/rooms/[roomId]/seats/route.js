import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Seat from "@/models/seat";
import Room from "@/models/room";

export async function GET(req, context) {
  try {
    await connectDB();

    const params = await context.params;
    const { roomId } = params;

    const seats = await Seat.find({ room: roomId });
    return NextResponse.json(seats);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách ghế" }, { status: 500 });
  }
}

export async function POST(req, context) {
  await connectDB();
  const { params } = context; // lấy params từ context
  const { roomId } = await params; // ✅ await để giải Promise

  const seats = await req.json();

  // Xóa sơ đồ cũ
  await Seat.deleteMany({ room: roomId });

  // Thêm ghế mới
  const newSeats = seats.map((s) => ({ ...s, room: roomId }));
  await Seat.insertMany(newSeats);

  return new Response(JSON.stringify({ message: "Lưu thành công" }), {
    status: 200,
  });
}


export async function PUT(req) {
  try {
    await connectDB();
    const { id, ...updateData } = await req.json();
    const updated = await Seat.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi khi cập nhật ghế" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    await Seat.findByIdAndDelete(id);
    return NextResponse.json({ message: "Đã xóa ghế" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi khi xóa ghế" }, { status: 500 });
  }
}


