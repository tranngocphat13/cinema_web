// src/app/api/check-out/start-vnpay/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";
import { buildVnpayUrl } from "@/lib/vnpay";

export async function POST(req) {
  try {
    const { showtimeId, seatIds, total, ticketType, customer } =
      await req.json();
    if (!showtimeId || !seatIds?.length || !total) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectDB();

    // 1. Tạo booking pending
    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType: ticketType || "normal",
      total,
      customer,
      status: "pending",
    });

    // 2. Giữ ghế 5 phút
    const expireAt = new Date(Date.now() + 5 * 60 * 1000);
    await Hold.insertMany(
      seatIds.map((id) => ({
        showtime: showtimeId,
        seat: id,
        booking: booking._id,
        status: "hold",
        expireAt,
      }))
    );

    // 3. Tạo URL thanh toán
    const ip =
      (req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1").split(",")[0].trim();

    const { redirectUrl } = buildVnpayUrl({
      amount: booking.total,
      orderId: booking._id.toString(), // dùng ObjectId làm TxnRef
      orderInfo: `Thanh toan ve xem phim - Booking ${booking._id}`,
      ipAddr: ip,
    });

    return NextResponse.json({ payUrl: redirectUrl, bookingId: booking._id });
  } catch (err) {
    console.error("start-vnpay error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
