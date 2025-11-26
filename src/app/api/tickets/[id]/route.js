export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

// ✅ QUAN TRỌNG: import model để populate không bị MissingSchemaError
import "@/models/showtimes";
import "@/models/movies";
import "@/models/seat";

import Booking from "@/models/booking";

export async function GET(_req, { params }) {
  try {
    await connectDB();

    const { id } = params; // ✅ KHÔNG await
    if (!id) return NextResponse.json({ error: "Thiếu ticket id" }, { status: 400 });

    const booking = await Booking.findById(id)
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title posterUrl" },
      })
      .populate("seats")
      .lean();

    if (!booking) {
      return NextResponse.json({ error: "Không tìm thấy vé" }, { status: 404 });
    }

    return NextResponse.json({ ticket: booking }, { status: 200 });
  } catch (err) {
    console.error("GET /api/tickets/[id] error:", err);
    return NextResponse.json({ error: err?.message || "Lỗi server" }, { status: 500 });
  }
}
