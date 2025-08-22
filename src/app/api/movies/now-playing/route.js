import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Movie from "@/models/movies";

export async function GET() {
  try {
    await dbConnect();

    const movies = await Movie.find({}) // hoặc { status: "now-playing" }
      .sort({ releaseDate: -1 })
      .populate("genres", "name"); // populate chỉ lấy field name

    return NextResponse.json({ success: true, data: movies });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
