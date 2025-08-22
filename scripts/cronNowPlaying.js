import 'dotenv/config';
import nodeCron from 'node-cron';
import fetch from 'node-fetch';
import dbConnect from '../src/lib/mongodb.js';
import Movie from '../src/models/movies.js';
import Genre from '../src/models/genres.js';

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

function toEmbedUrl(key) {
  return key ? `https://www.youtube.com/embed/${key}?autoplay=1` : "";
}

async function fetchNowPlaying() {
  let page = 1;
  let totalPages = 1;
  const allMovies = [];

  do {
    const res = await fetch(
      `${TMDB_BASE}/movie/now_playing?api_key=${API_KEY}&language=vi-VN&page=${page}&region=VN`
    );
    const json = await res.json();
    if (!json.results) break;

    totalPages = json.total_pages || 1;

    for (const item of json.results) {
      try {
        const detailRes = await fetch(
          `${TMDB_BASE}/movie/${item.id}?api_key=${API_KEY}&language=vi-VN&append_to_response=videos,credits`
        );
        const detail = await detailRes.json();

        const trailer = (detail.videos?.results || []).find(
          v => v.site === "YouTube" && ["Trailer", "Teaser"].includes(v.type)
        );

        allMovies.push({
          tmdbId: detail.id,
          title: detail.title,
          overview: detail.overview || "",
          duration: detail.runtime || 0,
          country: detail.production_countries?.[0]?.name || "",
          genres: detail.genres?.map(g => g.name) || [],
          director: (detail.credits?.crew || []).find(c => c.job === "Director")?.name || "",
          releaseDate: detail.release_date || null,
          actors: (detail.credits?.cast || []).slice(0, 5).map(a => a.name),
          posterUrl: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
          trailerUrl: toEmbedUrl(trailer?.key),
        });

      } catch (err) {
        console.error(`❌ Lỗi khi lấy chi tiết phim ID ${item.id}:`, err);
      }
    }

    page++;
  } while (page <= totalPages && page <= 5);

  return allMovies;
}

async function updateNowPlaying() {
  try {
    await dbConnect();
    const movies = await fetchNowPlaying();

    for (const movie of movies) {
      const genreIds = [];
      for (const g of movie.genres) {
        const genreDoc = await Genre.findOneAndUpdate(
          { name: g },
          { name: g },
          { upsert: true, new: true }
        );
        genreIds.push(genreDoc._id);
      }

      await Movie.findOneAndUpdate(
        { tmdbId: movie.tmdbId },
        { ...movie, genres: genreIds },
        { upsert: true, new: true }
      );
    }

    console.log(`✅ [${new Date().toLocaleString()}] Đã cập nhật ${movies.length} phim Now Playing`);
  } catch (err) {
    console.error("❌ Lỗi cập nhật phim:", err);
  }
}

// CRON JOB: chạy mỗi ngày lúc 03:00 sáng
nodeCron.schedule('0 3 * * *', () => {
  console.log(`🔄 [${new Date().toLocaleString()}] Đang chạy cron job...`);
  updateNowPlaying();
});

// Chạy ngay lần đầu tiên khi khởi động
updateNowPlaying();
