import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Seat from "@/models/seat";
import Booking from "@/models/booking";

const HOLD_MINUTES = 10;

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const { showtimeId } = params;
    const st = await Showtime.findById(showtimeId).populate("room");
    if (!st) return NextResponse.json({ error: "Showtime not found" }, { status: 404 });

    const seats = await Seat.find({ room: st.room._id }).lean();

    // Lấy các booking đang chiếm chỗ (paid hoặc pending trong HOLD_MINUTES)
    const holdSince = new Date(Date.now() - HOLD_MINUTES * 60 * 1000);
    const locks = await Booking.find({
      showtime: showtimeId,
      status: { $in: ["paid", "pending"] },
      createdAt: { $gte: holdSince },
    }).select("seats status createdAt").lean();

    const lockedIds = new Set(locks.flatMap(b => b.seats.map(String)));

    const payload = seats.map(s => ({
      _id: String(s._id),
      number: s.number,
      type: s.type,
      row: s.row,
      column: s.column,
      isAvailable: !lockedIds.has(String(s._id))
    }));

    return NextResponse.json(payload);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
