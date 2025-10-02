import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ tickets: [] }, { status: 200 });
    }

    await connectDB();

    // 🔎 lấy tất cả booking đã thanh toán của user
    const bookings = await Booking.find({
      "customer.email": session.user.email,
      status: "paid",
    })
      .populate({
        path: "showtime",
        populate: { path: "movie", select: "title poster" },
      })
      .populate("seats");

    return NextResponse.json({ tickets: bookings });
  } catch (err) {
    console.error("❌ /api/tickets error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
