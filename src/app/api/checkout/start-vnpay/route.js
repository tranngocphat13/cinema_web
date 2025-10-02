// src/app/api/check-out/start-vnpay/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";
import { buildVnpayUrl } from "@/lib/vnpay";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Bạn cần đăng nhập để đặt vé" }, { status: 401 });
    }

    const { showtimeId, seatIds, total, ticketType } = await req.json();
    if (!showtimeId || !seatIds?.length || !total) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectDB();

    // ✅ Tạo booking pending kèm thông tin user từ session
    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType: ticketType || "normal",
      total,
      customer: {
        name: session.user.name,
        email: session.user.email,
      },
      status: "pending",
      paymentMethod: "vnpay",
    });

    // Giữ ghế 5 phút
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

    // Tạo URL thanh toán VNPAY
    const ip =
      (req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1").split(",")[0].trim();

    const { redirectUrl } = buildVnpayUrl({
      amount: booking.total,
      orderId: booking._id.toString(),
      orderInfo: `Thanh toán vé xem phim - Booking ${booking._id}`,
      ipAddr: ip,
    });

    return NextResponse.json({ payUrl: redirectUrl, bookingId: booking._id });
  } catch (err) {
    console.error("start-vnpay error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
