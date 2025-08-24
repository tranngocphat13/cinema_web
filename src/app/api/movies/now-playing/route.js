import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.TMDB_API_KEY}&region=VN&language=vi-VN&page=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.status_message }, { status: res.status });
    }

    return NextResponse.json(data.results); // Trả về danh sách phim
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
