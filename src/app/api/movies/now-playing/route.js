import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import syncNowPlayingDaily from "@/lib/sync/tmdbNowPlayingDaily";

export const dynamic = "force-dynamic";

export async function GET() {
  // ✅ Auto sync 1 lần/ngày (giờ VN). Nếu hôm nay sync rồi -> skip rất nhanh.
  try {
    await syncNowPlayingDaily();
  } catch (e) {
    console.error("[now-playing] auto sync failed:", e?.message || e);
    // vẫn cho user xem data cũ trong DB
  }

  await connectDB();
  const movies = await Movie.find({ status: "now_playing" })
    .sort({ releaseDate: -1, createdAt: -1 })
    .lean();

  return NextResponse.json(movies);
}
