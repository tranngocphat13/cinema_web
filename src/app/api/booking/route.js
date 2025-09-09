import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Showtime from "@/models/showtimes";
import Seat from "@/models/seat";
import { calcTotal } from "@/lib/pricing";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { showtimeId, seatIds, ticketType, customer, paymentMethod } = body;
    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0 || !ticketType) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const st = await Showtime.findById(showtimeId);
    if (!st) return NextResponse.json({ error: "Showtime không tồn tại" }, { status: 404 });

    // Kiểm seat thuộc room
    const seats = await Seat.find({ _id: { $in: seatIds }, room: st.room });
    if (seats.length !== seatIds.length) return NextResponse.json({ error: "Ghế không hợp lệ" }, { status: 400 });

    // Check conflict (locked)
    const holdSince = new Date(Date.now() - 10 * 60 * 1000);
    const conflict = await Booking.findOne({
      showtime: showtimeId,
      seats: { $in: seatIds },
      status: { $in: ["paid", "pending"] },
      createdAt: { $gte: holdSince },
    });
    if (conflict) return NextResponse.json({ error: "Một vài ghế đã bị chọn" }, { status: 409 });

    const total = calcTotal(ticketType, seatIds.length);

    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType,
      total,
      status: "pending",
      paymentMethod: paymentMethod || "momo",
      customer: customer || {},
    });

    return NextResponse.json({ _id: booking._id, total: booking.total, status: booking.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
