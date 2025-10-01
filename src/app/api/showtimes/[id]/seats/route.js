// src/app/api/showtimes/[id]/seats/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Seat from "@/models/seat";
import { getLockedSeatIds } from "@/utils/locks";

export async function GET(_req, ctx) {
  try {
    await connectDB();

    const { id: showtimeId } = await ctx.params;
    const st = await Showtime.findById(showtimeId).populate("room");
    if (!st)
      return NextResponse.json(
        { error: "Showtime not found" },
        { status: 404 }
      );

    const seats = await Seat.find({ room: st.room._id }).lean();
    const locked = await getLockedSeatIds(showtimeId);

    const payload = seats.map((s) => ({
      _id: String(s._id),
      number: s.number,
      type: s.type,
      row: s.row,
      column: s.column,
      isAvailable: !locked.has(String(s._id)),
    }));

    return NextResponse.json(payload);
  } catch (e) {
    console.error("GET /api/showtimes/[id]/seats error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal error" },
      { status: 500 }
    );
  }
}
