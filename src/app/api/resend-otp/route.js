// src/app/api/movies/[id]/route.js
import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/mongodb.js";
import Movie from "../../../../models/movies.js";
import Genre from "../../../../models/genres.js";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(req, ctx) {
  try {
    const { id } = await ctx.params; // ✅ phải await
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await dbConnect();

    // 1. Tìm trong MongoDB
    let movie = await Movie.findOne({ tmdbId: Number(id) });
    if (movie) {
      console.log("📦 Lấy từ MongoDB");
      return NextResponse.json(movie);
    }

    // 2. Gọi TMDb API
    const res = await fetch(
      `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=vi-VN&append_to_response=videos,credits`
    );
    if (!res.ok) throw new Error("TMDb request failed");
    const data = await res.json();

    // 3. Lưu genre vào collection genres
    const genreIds = [];
    for (const g of data.genres) {
      let genre = await Genre.findOne({ name: g.name });
      if (!genre) {
        genre = await Genre.create({ name: g.name });
      }
      genreIds.push(genre._id);
    }

    // 4. Tìm trailer
    const trailer = data.videos?.results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer"
    );

    // 5. Lưu vào MongoDB
    movie = await Movie.create({
      tmdbId: data.id,
      title: data.title,
      duration: data.runtime || 0,
      country: data.production_countries?.[0]?.name || "",
      genres: genreIds,
      director:
        data.credits?.crew.find((c) => c.job === "Director")?.name || "",
      releaseDate: data.release_date ? new Date(data.release_date) : null,
      endDate: null,
      ageLimit: "",
      actors: data.credits?.cast.slice(0, 5).map((a) => a.name) || [],
      posterUrl: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : "",
      trailerUrl: trailer
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : "",
      description: data.overview,
    });

    console.log("💾 Lưu vào MongoDB");
    return NextResponse.json(movie);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
