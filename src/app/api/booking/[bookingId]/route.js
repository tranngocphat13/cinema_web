import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function POST(_req, { params }) {
  try {
    await connectDB();
    const { bookingId } = params;
    const b = await Booking.findById(bookingId);
    if (!b) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    if (b.status === "paid") return NextResponse.json({ ok: true, status: "paid" });

    b.status = "paid";
    await b.save();
    return NextResponse.json({ ok: true, status: "paid" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
