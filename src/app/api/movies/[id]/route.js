import { NextResponse } from "next/server";
import { getMovieDetail, getMovieVideos, getMovieCredits } from "@/lib/tmdb";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    const { id } = await context.params;
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "vi";
    const tmdbLang = lang === "en" ? "en-US" : "vi-VN";

    await connectDB();

    // Tìm kiếm trong MongoDB trước để xác định tmdbId và _id
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    let dbMovie = null;

    if (isObjectId) {
      dbMovie = await Movie.findById(id).lean();
    } else {
      dbMovie = await Movie.findOne({ tmdbId: Number(id) }).lean();
    }

    const targetTmdbId = dbMovie?.tmdbId ? String(dbMovie.tmdbId) : id;

    // Lấy chi tiết phim từ TMDB theo ngôn ngữ
    let detail = null;
    try {
      detail = await getMovieDetail(targetTmdbId, tmdbLang);
    } catch {
      detail = null;
    }

    // Nếu không tìm thấy trên TMDB và cũng không có trong DB
    if (!detail?.id && !dbMovie) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Lấy trailer
    let trailer = null;
    let credits = null;
    try {
      const videos = await getMovieVideos(targetTmdbId, tmdbLang);
      trailer =
        videos?.results?.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
        videos?.results?.[0];
      credits = await getMovieCredits(targetTmdbId, tmdbLang).catch(() => null);
    } catch {}

    const isAnimation =
      (detail?.genres || []).some(
        (g) =>
          g.id === 16 ||
          g.name?.toLowerCase().includes("hoạt hình") ||
          g.name?.toLowerCase().includes("animation")
      ) || (dbMovie?.genres || []).some((g) => g.toLowerCase().includes("hoạt hình") || g.toLowerCase().includes("animation"));

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

    // Định dạng dữ liệu trả về kết hợp TMDB + MongoDB
    const title = detail
      ? (detail.title || detail.original_title)
      : (lang === "en" ? (dbMovie.titleEn || dbMovie.originalTitle || dbMovie.title) : dbMovie.title);

    const movie = {
      _id: dbMovie?._id ? String(dbMovie._id) : undefined,
      tmdbId: detail?.id || dbMovie?.tmdbId || Number(id),
      title,
      titleEn: detail?.original_title || dbMovie?.titleEn || dbMovie?.originalTitle || title,
      titleVi: detail?.title || dbMovie?.title || title,
      originalTitle: detail?.original_title || dbMovie?.originalTitle || title,
      overview: detail?.overview || (lang === "en" ? (dbMovie?.overviewEn || dbMovie?.overview) : dbMovie?.overview) || "",
      overviewEn: detail?.overview || dbMovie?.overviewEn || dbMovie?.overview || "",
      genres: detail?.genres?.map((g) => g.name) || dbMovie?.genres || [],
      posterUrl: detail?.poster_path
        ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
        : dbMovie?.posterUrl || "",
      backdropUrl: detail?.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
        : dbMovie?.backdropUrl || "",
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : dbMovie?.trailerUrl || "",
      releaseDate: detail?.release_date || dbMovie?.releaseDate || null,
      status: dbMovie?.status || (detail?.release_date && new Date(detail.release_date) <= new Date() ? "now_playing" : "upcoming"),
      runtime: detail?.runtime || dbMovie?.runtime || 110,
      ratingLabel: detail?.vote_average
        ? `${detail.vote_average.toFixed(1)}/10`
        : dbMovie?.ratingLabel || (lang === "en" ? "No rating" : "Chưa có đánh giá"),
      countries: detail?.production_countries?.map((c) => c.iso_3166_1) || dbMovie?.countries || [],
      isAnimation,
      cast,
    };

    return NextResponse.json(movie);
  } catch (err) {
    console.error("Error in /movies/[id]:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
