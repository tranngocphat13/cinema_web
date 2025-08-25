import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export const dynamic = "force-dynamic";

export async function GET() {
  await connectDB();
  const movies = await Movie.find({ status: "now_playing" })
    .sort({ releaseDate: -1, createdAt: -1 })
    .lean();
  return NextResponse.json(movies);
}
