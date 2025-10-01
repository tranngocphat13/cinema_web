// src/app/api/vnpay/return/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";
import Hold from "@/models/holdseat";
import { verifyVnpReturn } from "@/lib/vnpay";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const { isValid, params: sorted } = verifyVnpReturn(params);
    if (!isValid) {
      return NextResponse.json({ message: "Chữ ký không hợp lệ" }, { status: 400 });
    }

    await connectDB();
    const bookingId = sorted.vnp_TxnRef.split("-")[0]; // lấy ObjectId trước dấu "-"
    const booking = await Booking.findById(bookingId);
    if (!booking)
      return NextResponse.json(
        { message: "Không tìm thấy đơn đặt chỗ" },
        { status: 404 }
      );

    if (sorted.vnp_ResponseCode === "00" && sorted.vnp_TransactionStatus === "00") {
      booking.status = "paid";
      await booking.save();
      await Hold.deleteMany({ booking: booking._id }); // xoá hold => ghế chính thức bị khoá
      return NextResponse.json({ message: "Thanh toán thành công", bookingId: booking._id });
    }

    // Nếu thất bại: huỷ booking + mở ghế
    booking.status = "canceled";
    await booking.save();
    await Hold.deleteMany({ booking: booking._id });
    return NextResponse.json({ message: "Thanh toán thất bại" }, { status: 400 });
  } catch (e) {
    console.error("Return error:", e);
    return NextResponse.json({ message: "Lỗi xử lý VNPAY", error: e.message }, { status: 500 });
  }
}
