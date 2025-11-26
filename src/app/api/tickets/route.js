export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";

// ✅ QUAN TRỌNG: import model để populate không bị MissingSchemaError
import "@/models/showtimes";
import "@/models/movies";
import "@/models/seat";

import Booking from "@/models/booking";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ tickets: [] }, { status: 200 });
    }

    await connectDB();

    const bookings = await Booking.find({
      "customer.email": session.user.email,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title posterUrl" }, // ✅ posterUrl (schema của bạn dùng posterUrl)
      })
      .populate("seats")
      .lean();

    return NextResponse.json({ tickets: bookings }, { status: 200 });
  } catch (err) {
    console.error("❌ /api/tickets error:", err);
    return NextResponse.json({ error: err?.message || "Lỗi server" }, { status: 500 });
  }
}
