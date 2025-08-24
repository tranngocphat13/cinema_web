import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "now_playing";

  const movies = await Movie.find({ status }).sort({ releaseDate: -1 });

  return NextResponse.json(movies);
}
