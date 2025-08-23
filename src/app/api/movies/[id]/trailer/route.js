import { NextResponse } from "next/server";

const API_KEY = process.env.TMDB_API_KEY; // Lưu key TMDB trong .env

export async function GET(req, { params }) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${params.id}/videos?api_key=${API_KEY}&language=vi-VN`);
    const data = await res.json();

    const trailer = data.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    if (!trailer) {
      return NextResponse.json({ error: "Không có trailer" }, { status: 404 });
    }

    return NextResponse.json({ trailerUrl: `https://www.youtube.com/embed/${trailer.key}` });
  } catch (err) {
    console.error("GET /movies/:id/trailer error:", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
