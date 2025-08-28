// src/app/api/showtimes/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";

export async function GET() {
  try {
    await connectDB();
    const showtimes = await Showtime.find().populate("movie");
    return NextResponse.json(showtimes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const newShowtime = await Showtime.create({
      movie: body.movie,
      startTime: new Date(body.startTime),
      room: body.room,
    });

    return NextResponse.json(newShowtime);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
