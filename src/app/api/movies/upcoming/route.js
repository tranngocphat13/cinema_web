import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import { getUpcomingPages } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") || "vi";

  try {
    await connectDB();

    // 1. Kiểm tra trong MongoDB
    let dbUpcoming = await Movie.find({
      $or: [
        { status: "upcoming" },
        { releaseDate: { $gt: new Date() } }
      ]
    })
      .sort({ releaseDate: 1 })
      .lean();

    // 2. Nếu DB chưa có hoặc quá ít phim sắp chiếu, tự động sync từ TMDB upcoming
    if (dbUpcoming.length < 5) {
      try {
        const tmdbUpcoming = await getUpcomingPages({ language: lang === "en" ? "en-US" : "vi-VN", maxPages: 2 });
        if (Array.isArray(tmdbUpcoming) && tmdbUpcoming.length > 0) {
          const ops = tmdbUpcoming.map((m) => ({
            updateOne: {
              filter: { tmdbId: m.id },
              update: {
                $set: {
                  tmdbId: m.id,
                  title: m.title || m.original_title,
                  titleEn: m.original_title || m.title,
                  originalTitle: m.original_title || m.title,
                  overview: m.overview || "",
                  posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
                  backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
                  releaseDate: m.release_date ? new Date(m.release_date) : null,
                  status: "upcoming",
                },
              },
              upsert: true,
            },
          }));
          await Movie.bulkWrite(ops, { ordered: false });

          dbUpcoming = await Movie.find({
            $or: [
              { status: "upcoming" },
              { releaseDate: { $gt: new Date() } }
            ]
          })
            .sort({ releaseDate: 1 })
            .lean();
        }
      } catch (syncErr) {
        console.error("TMDB upcoming sync error:", syncErr);
      }
    }

    const movies = dbUpcoming.map((m) => {
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
  } catch (error) {
    console.error("GET /api/movies/upcoming error:", error);
    return NextResponse.json({ error: "Lỗi khi lấy danh sách phim sắp chiếu" }, { status: 500 });
  }
}
