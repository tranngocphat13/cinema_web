export const runtime = "nodejs";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";
import { buildVnpayUrl } from "@/lib/vnpay";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

function getClientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  const xr = req.headers.get("x-real-ip");
  let ip = (xf || xr || "127.0.0.1").split(",")[0].trim();
  if (!ip || ip === "::1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Bạn cần đăng nhập để đặt vé" },
        { status: 401 }
      );
    }

    const { showtimeId, seatIds, total, ticketType } = await req.json();
    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0 || !total) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    await connectDB();

    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType: ticketType || "normal",
      total,
      customer: { name: session.user?.name || "User", email: session.user?.email || "" },
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

    const ip = getClientIp(req);

    // ✅ QUAN TRỌNG: TxnRef ngắn, dùng bookingId (24 ký tự)
    const txnRef = booking._id.toString();

    const { redirectUrl, vnpParams } = buildVnpayUrl({
      amount: booking.total,
      orderId: txnRef,
      orderInfo: `Thanh toán vé xem phim - Booking ${txnRef}`,
      ipAddr: ip,
    });

    console.log("VNP START DEBUG", {
      txnRef,
      txnRefLen: txnRef.length,
      createDate: vnpParams?.vnp_CreateDate,
      expireDate: vnpParams?.vnp_ExpireDate,
      ip,
      returnUrl: vnpParams?.vnp_ReturnUrl,
    });

    return NextResponse.json({ payUrl: redirectUrl, bookingId: booking._id });
  } catch (err) {
    console.error("start-vnpay error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
