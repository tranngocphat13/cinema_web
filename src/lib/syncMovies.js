// lib/syncMovies.js
import clientPromise from "./mongodb.js";

const TMDB_API_KEY = process.env.TMDB_API_KEY;

export async function syncMovies() {
  const client = await clientPromise;
  const db = client.db("test"); // lấy DB "test"

  async function fetchMovies(type) {
    const url = `https://api.themoviedb.org/3/movie/${type}?api_key=${TMDB_API_KEY}&language=vi-VN&region=VN&page=1`;
    const res = await fetch(url);
    const data = await res.json();

    return (data.results || []).map(m => ({
      tmdbId: m.id,
      title: m.title,
      overview: m.overview,
      posterUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
      releaseDate: m.release_date,
      status: type,
      updatedAt: new Date(),
    }));
  }

  const nowPlaying = await fetchMovies("now_playing");
  const upcoming = await fetchMovies("upcoming");
  const movies = [...nowPlaying, ...upcoming];

  for (const movie of movies) {
    await db.collection("movies").updateOne(
      { tmdbId: movie.tmdbId },
      { $set: movie },
      { upsert: true }
    );
  }

  console.log(`Đã đồng bộ ${movies.length} phim từ TMDB`);
}
