import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Seat from "@/models/seat";
import Hold from "@/models/holdseat";
import Booking from "@/models/booking";
import { getLockedSeatIds } from "@/utils/locks";

export async function POST(req) {
  try {
    await connectDB();

    const { showtimeId, seatIds, total, ticketType, customer } = await req.json();
    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0 || !customer) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    // 1) Validate showtime + seats thuộc đúng phòng
    const st = await Showtime.findById(showtimeId).populate("room");
    if (!st) return NextResponse.json({ error: "Showtime không tồn tại" }, { status: 404 });

    const seats = await Seat.find({ _id: { $in: seatIds }, room: st.room });
    if (seats.length !== seatIds.length) {
      return NextResponse.json({ error: "Có ghế không thuộc phòng của suất chiếu" }, { status: 400 });
    }

    // 2) Không đụng ghế đã bị khoá
    const locked = await getLockedSeatIds(showtimeId);
    const conflicts = seatIds.filter((id) => locked.has(String(id)));
    if (conflicts.length) {
      return NextResponse.json({ error: "Một số ghế đã bị giữ/đặt", conflicts }, { status: 409 });
    }

    // 3) Tạo booking PAID ngay (auto success)
    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType: ticketType || "normal",
      total: Number(total || 0),
      status: "paid",
      paymentMethod: "dev-auto",
      customer,
    });

    // 4) Dọn mọi Hold liên quan để sạch DB
    await Hold.deleteMany({ showtime: showtimeId, seat: { $in: seatIds } });

    return NextResponse.json({ ok: true, booking });
  } catch (err) {
    console.error("dev-pay error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
