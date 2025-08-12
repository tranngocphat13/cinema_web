import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Movie from "@/models/movies";
import Genre from "@/models/genres";

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function fetchAllNowPlaying(region = "VN") {
  let allMovies = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(
      `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=vi-VN&region=${region}&page=${page}`
    );
    const data = await res.json();
    allMovies.push(...data.results);
    totalPages = data.total_pages;
    page++;
  } while (page <= totalPages);

  return allMovies;
}

async function fetchMovieDetail(id) {
  const res = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=vi-VN&append_to_response=credits,videos`
  );
  return res.json();
}

export async function GET() {
  try {
    await dbConnect();

    const nowPlayingList = await fetchAllNowPlaying("VN");

    const savedMovies = [];

    for (const movie of nowPlayingList) {
      const detail = await fetchMovieDetail(movie.id);

      // Lấy genres, upsert vào DB
      const genreIds = [];
      for (const g of detail.genres || []) {
        const genreDoc = await Genre.findOneAndUpdate(
          { name: g.name },
          { name: g.name },
          { upsert: true, new: true }
        );
        genreIds.push(genreDoc._id);
      }

      // Lấy trailer YouTube
      const trailer = detail.videos?.results.find(
        (v) => v.type === "Trailer"
      );

      // Debug trailer
      console.log(`Movie: ${detail.title}, Trailer key: ${trailer?.key}`);

      // Upsert phim
      const saved = await Movie.findOneAndUpdate(
        { tmdbId: detail.id },
        {
          tmdbId: detail.id,
          title: detail.title,
          duration: detail.runtime || 0,
          country: detail.production_countries?.[0]?.name || "",
          genres: genreIds,
          director:
            detail.credits?.crew.find((c) => c.job === "Director")?.name || "",
          releaseDate: detail.release_date ? new Date(detail.release_date) : null,
          actors: detail.credits?.cast.slice(0, 5).map((a) => a.name) || [],
          posterUrl: detail.poster_path
            ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
            : "",
          trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
          description: detail.overview,
        },
        { upsert: true, new: true }
      );

      savedMovies.push(saved);
    }

    return NextResponse.json({ success: true, data: savedMovies });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
