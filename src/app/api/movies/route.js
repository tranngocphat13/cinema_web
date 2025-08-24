// app/api/movies/route.js
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const movies = await Movie.find({ status: { $in: ["now_playing", "upcoming"] } }).sort({ releaseDate: 1 });
    return NextResponse.json(movies);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi lấy danh sách phim" }, { status: 500 });
  }
}
