import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Room from "@/models/room";
import Showtime from "@/models/showtimes";

export async function POST(req, { params }) {
  await dbConnect();

  try {
    const { cinemaId } = await params; // ✅ lấy cinemaId
    const { startTime, endTime } = await req.json();

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Thiếu startTime hoặc endTime" },
        { status: 400 }
      );
    }

    // Lấy tất cả phòng của rạp đó
    const rooms = await Room.find({ cinema: cinemaId });

    // 🛡️ Lấy tất cả suất chiếu trong cùng khung giờ (+10 phút dọn vệ sinh)
    const CLEANING_BUFFER_MS = 10 * 60 * 1000;
    const startBuffer = new Date(new Date(startTime).getTime() - CLEANING_BUFFER_MS);
    const endBuffer = new Date(new Date(endTime).getTime() + CLEANING_BUFFER_MS);

    const showtimes = await Showtime.find({
      room: { $in: rooms.map((r) => r._id) },
      startTime: { $lt: endBuffer },
      endTime: { $gt: startBuffer },
    });

    // Tìm các phòng đã có suất chiếu
    const occupiedRoomIds = showtimes.map((s) => s.room.toString());

    // Lọc ra phòng trống
    const freeRooms = rooms.filter(
      (room) => !occupiedRoomIds.includes(room._id.toString())
    );

    return NextResponse.json(freeRooms);
  } catch (error) {
    console.error("❌ Error checking free rooms:", error);
    return NextResponse.json(
      { error: "Lỗi khi kiểm tra phòng trống" },
      { status: 500 }
    );
  }
}
