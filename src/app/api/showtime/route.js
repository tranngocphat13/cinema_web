import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtime";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const movieId = searchParams.get("movieId");
  if (!movieId) return new Response(JSON.stringify([]), { status: 400 });

  const showtimes = await Showtime.find({ movie: movieId })
    .populate("room")
    .sort({ startTime: 1 });

  return new Response(JSON.stringify(showtimes));
}
