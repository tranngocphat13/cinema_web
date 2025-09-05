// src/app/api/showtimes/[id]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";

export async function DELETE(_req, context) {
  try {
    await connectDB();
    const { id } = await context.params;

    await Showtime.findByIdAndDelete(id);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, context) {
  try {
    await connectDB();
    const { id } = await context.params;
    const body = await req.json();

    // ✅ Kiểm tra movie tồn tại
    const movie = await Movie.findById(body.movie);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }  

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      id,
      {
        movie: movie._id,
        startTime: new Date(body.startTime),
        room: body.room,
      },
      { new: true }
    ).populate("movie");

    if (!updatedShowtime) {
      return NextResponse.json({ error: "Showtime not found" }, { status: 404 });
    }

    return NextResponse.json(updatedShowtime);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
