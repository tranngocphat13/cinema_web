import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";   // ❌ bạn quên import Movie
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const movieId = searchParams.get("movie");

    const query = {};
    if (movieId && mongoose.Types.ObjectId.isValid(movieId)) {
      query.movie = new mongoose.Types.ObjectId(movieId); // lọc đúng movie
    }

    const showtimes = await Showtime.find(query).populate("movie");
    return NextResponse.json(showtimes);
  } catch (error) {
    console.error("GET showtimes error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    // ✅ kiểm tra movie tồn tại
    const movie = await Movie.findById(body.movie);
    if (!movie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    const newShowtime = await Showtime.create({
      movie: movie._id,
      startTime: new Date(body.startTime),
      room: body.room,
    });

    return NextResponse.json(newShowtime);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
