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

    // Lấy tất cả suất chiếu trong cùng khung giờ
    const showtimes = await Showtime.find({
      room: { $in: rooms.map((r) => r._id) },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } } // có overlap thời gian
      ]
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
