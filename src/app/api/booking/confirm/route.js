import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";
import Seat from "@/models/seat";
import Showtime from "@/models/showtimes";

export async function POST(req) {
  await connectDB();

  try {
    const { showtimeId, seatIds, customer, paymentMethod, total, ticketType } = await req.json();

    if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0 || !customer) {
      return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 });
    }

    const st = await Showtime.findById(showtimeId).populate("room");
    if (!st) return NextResponse.json({ error: "Showtime không tồn tại" }, { status: 404 });

    const seats = await Seat.find({ _id: { $in: seatIds }, room: st.room });
    if (seats.length !== seatIds.length) {
      return NextResponse.json({ error: "Ghế không hợp lệ" }, { status: 400 });
    }

    const now = new Date();

    // Kiểm tra ghế còn được hold bởi mình (còn hạn) hoặc ít nhất chưa bị người khác đặt
    const activeHolds = await Hold.find({
      showtime: showtimeId,
      seat: { $in: seatIds },
      status: "hold",
      expireAt: { $gt: now },
    });

    // Nếu 1 ghế không có hold hợp lệ => vẫn phải chắc chắn không bị booking chiếm
    const activeBookings = await Booking.find({
      showtime: showtimeId,
      status: { $in: ["pending", "paid"] },
      seats: { $in: seatIds },
    }).select("_id seats");

    if (activeBookings.length > 0) {
      return NextResponse.json({ error: "Ghế đã bị đặt" }, { status: 409 });
    }

    // Tạo booking (giữ ở trạng thái paid hoặc pending tuỳ flow thanh toán của bạn)
    const booking = await Booking.create({
      showtime: showtimeId,
      seats: seatIds,
      ticketType: ticketType || "normal",
      total: Number(total || 0),
      status: paymentMethod === "cash" ? "pending" : "paid", // tuỳ chỉnh theo cổng thanh toán
      paymentMethod: paymentMethod || "momo",
      customer,
    });

    // Xoá hold liên quan để giải phóng database
    await Hold.deleteMany({
      showtime: showtimeId,
      seat: { $in: seatIds },
    });

    return NextResponse.json({ ok: true, booking }, { status: 201 });
  } catch (err) {
    console.error("❌ Confirm booking error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
