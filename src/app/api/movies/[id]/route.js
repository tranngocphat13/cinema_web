import { NextResponse } from "next/server";
import { getMovieDetail, getMovieVideos } from "@/lib/tmdb";

export const dynamic = "force-dynamic";

export async function GET(_req, context) {
  try {
    const { id } = await context.params; // ✅ Bắt buộc phải await

    // Lấy chi tiết phim từ TMDB
    const detail = await getMovieDetail(id, "vi-VN");
    if (!detail?.id) {
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });
    }

    // Lấy trailer
    const videos = await getMovieVideos(id, "vi-VN");
    const trailer = videos?.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    // Định dạng dữ liệu trả về
    const movie = {
      tmdbId: detail.id,
      title: detail.title,
      overview: detail.overview,
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
        : "Chưa có đánh giá",
      countries: detail.production_countries?.map((c) => c.iso_3166_1) || [],
    };

    return NextResponse.json(movie);
  } catch (err) {
    console.error("Error in /movies/[id]:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
