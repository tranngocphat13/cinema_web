import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const detailRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=vi-VN`
    );
    const detail = await detailRes.json();

    const videoRes = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${process.env.TMDB_API_KEY}&language=vi-VN`
    );
    const videoData = await videoRes.json();

    const trailer = videoData.results?.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    return NextResponse.json({ ...detail, trailer: trailer || null });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
