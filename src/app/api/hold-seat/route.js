import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hold from "@/models/holdseat";
import Showtime from "@/models/showtimes";
import Seat from "@/models/seat";
import { getLockedSeatIds } from "@/utils/locks";

const HOLD_MINUTES = Number(process.env.HOLD_MINUTES || 5);
function getExpireAt() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + HOLD_MINUTES);
  return d;
}

export async function POST(req) {
  try {
    await connectDB();
    const { showtimeId, seatIds, bookingId } = await req.json();
    if (!showtimeId || !Array.isArray(seatIds) || !seatIds.length) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const st = await Showtime.findById(showtimeId).populate("room");
    if (!st) return NextResponse.json({ error: "Showtime không tồn tại" }, { status: 404 });

    const seats = await Seat.find({ _id: { $in: seatIds }, room: st.room });
    if (seats.length !== seatIds.length) {
      return NextResponse.json({ error: "Ghế không hợp lệ" }, { status: 400 });
    }

    // check locked seats
    const locked = await getLockedSeatIds(showtimeId);
    const conflicts = seatIds.filter(id => locked.has(String(id)));
    if (conflicts.length) {
      return NextResponse.json({ error: "Một số ghế đã bị giữ/đặt", conflicts }, { status: 409 });
    }

    const expireAt = getExpireAt();
    const docs = seatIds.map(seat => ({
      showtime: showtimeId,
      seat,
      status: "hold",
      expireAt,
      booking: bookingId || null,
    }));
    const holds = await Hold.insertMany(docs);

    return NextResponse.json({
      ok: true,
      expireAt,
      holds: holds.map(h => ({ _id: h._id.toString(), seat: h.seat.toString() })),
    });
  } catch (e) {
    console.error("hold-seat POST error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { showtimeId, seatIds } = await req.json();
    if (!showtimeId) return NextResponse.json({ error: "Thiếu showtimeId" }, { status: 400 });

    const now = new Date();
    const query = { showtime: showtimeId, status: "hold", expireAt: { $gt: now } };
    if (Array.isArray(seatIds) && seatIds.length) query.seat = { $in: seatIds };

    const res = await Hold.deleteMany(query);
    return NextResponse.json({ ok: true, released: res.deletedCount || 0 });
  } catch (e) {
    console.error("hold-seat DELETE error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
