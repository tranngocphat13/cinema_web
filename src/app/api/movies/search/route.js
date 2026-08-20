import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const lang = url.searchParams.get("lang") || "vi";

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    await connectDB();

    // Escape regex special chars
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedQuery, "i");

    const rawMovies = await Movie.find({
      $or: [
        { title: regex },
        { titleEn: regex },
        { originalTitle: regex },
        { genres: regex },
      ],
    })
      .sort({ releaseDate: -1 })
      .limit(8)
      .lean();

    const results = rawMovies.map((m) => {
      const displayTitle =
        lang === "en"
          ? m.titleEn || m.originalTitle || m.title
          : m.title || m.originalTitle;

      return {
        _id: m._id,
        tmdbId: m.tmdbId,
        title: displayTitle,
        originalTitle: m.originalTitle || m.title,
        posterUrl: m.posterUrl || "",
        releaseDate: m.releaseDate || null,
        status: m.status || "now_playing",
        genres: m.genres || [],
        ratingLabel: m.ratingLabel || "",
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/movies/search error:", error);
    return NextResponse.json({ error: "Lỗi tìm kiếm phim" }, { status: 500 });
  }
}
