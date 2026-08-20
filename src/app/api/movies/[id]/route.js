import { NextResponse } from "next/server";
import { getMovieDetail, getMovieVideos, getMovieCredits } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "vi";
    const tmdbLang = lang === "en" ? "en-US" : "vi-VN";

    // Lấy chi tiết phim từ TMDB theo ngôn ngữ
    const detail = await getMovieDetail(id, tmdbLang);
    if (!detail?.id) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Lấy trailer
    const videos = await getMovieVideos(id, tmdbLang);
    const trailer = videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    ) || videos?.results?.[0];

    // Lấy diễn viên / diễn viên lồng tiếng
    const credits = await getMovieCredits(id, tmdbLang).catch(() => null);
    const isAnimation = (detail.genres || []).some(
      (g) =>
        g.id === 16 ||
        g.name?.toLowerCase().includes("hoạt hình") ||
        g.name?.toLowerCase().includes("animation")
    );

    const cast = (credits?.cast || []).slice(0, 16).map((c) => ({
      id: c.id,
      name: c.name || c.original_name,
      character: c.character || "",
      profileUrl: c.profile_path
        ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
        : "",
      isVoice:
        isAnimation ||
        (c.character &&
          (c.character.toLowerCase().includes("voice") ||
            c.character.toLowerCase().includes("lồng tiếng"))),
    }));

    // Định dạng dữ liệu trả về
    const movie = {
      tmdbId: detail.id,
      title: detail.title || detail.original_title,
      titleEn: detail.original_title || detail.title,
      titleVi: detail.title || detail.original_title,
      originalTitle: detail.original_title,
      overview: detail.overview || "",
      genres: detail.genres?.map((g) => g.name) || [],
      posterUrl: detail.poster_path
        ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
        : "",
      backdropUrl: detail.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
        : "",
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
      releaseDate: detail.release_date || null,
      status:
        detail.release_date && new Date(detail.release_date) <= new Date()
          ? "now_playing"
          : "upcoming",
      runtime: detail.runtime || null,
      ratingLabel: detail.vote_average
        ? `${detail.vote_average.toFixed(1)}/10`
        : (lang === "en" ? "No rating" : "Chưa có đánh giá"),
      countries: detail.production_countries?.map((c) => c.iso_3166_1) || [],
      isAnimation,
      cast,
    };

    return NextResponse.json(movie);
  } catch (err) {
    console.error("Error in /movies/[id]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
