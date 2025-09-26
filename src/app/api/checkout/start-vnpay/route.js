import { NextResponse } from "next/server";
import { buildVnpayUrl } from "@/lib/vnpay";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";


export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();
    const { showtimeId, seatIds, total, ticketType, customer } = body || {};

    if (!showtimeId || !seatIds || !total) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectDB();
    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      total,
      ticketType,
      customer,
      status: "pending",
    });

    const ipAddr =
      (req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1")
        .split(",")[0]
        .trim();

    const payUrl = buildVnpayUrl({
      amount: total,
      orderId: booking._id.toString(),
      orderInfo: `Thanh toan ve xem phim - Booking ${booking._id}`,
      ipAddr,
      returnUrl: process.env.VNP_RETURN_URL,
    });

    return NextResponse.json({ payUrl });
  } catch (err) {
    console.error("start-vnpay error:", err);
    return NextResponse.json(
      { error: "Không tạo được thanh toán VNPAY" },
      { status: 500 }
    );
  }
}
