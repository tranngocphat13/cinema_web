import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import syncNowPlayingDaily from "@/lib/sync/tmdbNowPlayingDaily";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "vi";

  // ✅ Auto sync chạy nền không block response người dùng
  syncNowPlayingDaily().catch((e) => {
    console.error("[now-playing] auto sync error:", e?.message || e);
  });

  await connectDB();
  const rawMovies = await Movie.find({ status: "now_playing" })
    .sort({ releaseDate: -1, createdAt: -1 })
    .lean();

  const movies = rawMovies.map((m) => {
    const title =
      lang === "en"
        ? m.titleEn || m.originalTitle || m.title
        : m.title || m.originalTitle;

    return {
      ...m,
      title,
      originalTitle: m.originalTitle || m.title,
      titleEn: m.titleEn || m.originalTitle || m.title,
      titleVi: m.title || m.originalTitle,
    };
  });

  return NextResponse.json(movies);
}
