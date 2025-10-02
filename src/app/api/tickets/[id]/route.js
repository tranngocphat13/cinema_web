// src/app/api/tickets/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function GET(_req, ctx) {
  try {
    await connectDB();

    // 🔑 Lấy id từ params (phải await)
    const { id } = await ctx.params;

    const booking = await Booking.findById(id)
      .populate({
        path: "showtime",
        populate: { path: "movie" },
      })
      .populate("seats");

    if (!booking) {
      return NextResponse.json(
        { error: "Không tìm thấy vé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticket: booking });
  } catch (err) {
    console.error("GET /api/tickets/[id] error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi server" },
      { status: 500 }
    );
  }
}
