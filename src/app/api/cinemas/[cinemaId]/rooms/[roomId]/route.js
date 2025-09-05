import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Room from "@/models/room";
import Seat from "@/models/seat";

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json({ error: "Thiếu roomId" }, { status: 400 });
    }

    const deletedRoom = await Room.findByIdAndDelete(roomId);
    if (!deletedRoom) {
      return NextResponse.json({ error: "Phòng không tồn tại" }, { status: 404 });
    }

    // Nếu muốn xoá ghế kèm theo phòng:
    // await Seat.deleteMany({ room: roomId });

    return NextResponse.json({ message: "Xoá phòng thành công" }, { status: 200 });
  } catch (err) {
    console.error("Lỗi khi xoá phòng:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
