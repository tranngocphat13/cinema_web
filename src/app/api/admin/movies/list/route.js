import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function GET() {
  await connectDB();
  const movies = await Movie.find().sort({ releaseDate: -1 });
  return NextResponse.json({ movies });
}
