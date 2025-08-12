// fetchNowPlaying.js
import 'dotenv/config';
import fetch from 'node-fetch';
import { MongoClient } from 'mongodb';

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DBNAME;

function toEmbedUrl(key) {
  if (!key) return "";
  return `https://www.youtube.com/embed/${key}?autoplay=1`;
}

async function fetchNowPlaying() {
  let page = 1;
  let totalPages = 1;
  const allMovies = [];

  do {
    const res = await fetch(`${TMDB_BASE}/movie/now_playing?api_key=${API_KEY}&language=vi-VN&page=${page}&region=VN`);
    const json = await res.json();

    if (!json.results) break;
    totalPages = json.total_pages || 1;

    for (const item of json.results) {
      // Fetch chi tiết phim
      const detailRes = await fetch(`${TMDB_BASE}/movie/${item.id}?api_key=${API_KEY}&language=vi-VN&append_to_response=videos,credits`);
      const detail = await detailRes.json();

      // Lấy trailer YouTube
      const trailer = (detail.videos?.results || []).find(
        v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      );

      allMovies.push({
        tmdbId: detail.id,
        title: detail.title,
        duration: detail.runtime || 0,
        country: detail.production_countries?.[0]?.name || "",
        genres: detail.genres?.map(g => g.name) || [],
        director: (detail.credits?.crew || []).find(c => c.job === "Director")?.name || "",
        releaseDate: detail.release_date || null,
        actors: (detail.credits?.cast || []).slice(0, 5).map(a => a.name),
        posterUrl: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
        trailerUrl: trailer ? toEmbedUrl(trailer.key) : "",
        description: detail.overview || "",
      });
    }

    page++;
  } while (page <= totalPages && page <= 5); // Giới hạn 5 trang

  return allMovies;
}

async function saveToDB(movies) {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection("now_playing");

    for (const movie of movies) {
      await collection.updateOne(
        { tmdbId: movie.tmdbId },
        { $set: movie },
        { upsert: true }
      );
    }
    console.log(`✅ Đã lưu/ cập nhật ${movies.length} phim vào DB`);
  } catch (err) {
    console.error("❌ Lỗi khi lưu DB:", err);
  } finally {
    await client.close();
  }
}

(async () => {
  try {
    console.log("🔄 Đang fetch dữ liệu now-playing từ TMDb...");
    const movies = await fetchNowPlaying();
    console.log(`📦 Lấy được ${movies.length} phim`);
    await saveToDB(movies);
    console.log("🎯 Hoàn tất!");
  } catch (err) {
    console.error("❌ Lỗi:", err);
  }
})();
