// scripts/fetchNowPlaying.js
// Chạy: node scripts/fetchNowPlaying.js
// Yêu cầu: Node >= 18 (có fetch sẵn) hoặc cài: npm i node-fetch dotenv

import 'dotenv/config';
import fetch from 'node-fetch'; // Nếu Node >=18 có thể bỏ dòng này

const API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = "https://api.themoviedb.org/3";

if (!API_KEY) {
  console.error("❌ Lỗi: Chưa thiết lập TMDB_API_KEY trong file .env");
  process.exit(1);
}

function toEmbedUrl(key) {
  return key ? `https://www.youtube.com/embed/${key}?autoplay=1` : "";
}

async function fetchNowPlaying() {
  let page = 1;
  let totalPages = 1;
  const allMovies = [];

  do {
    console.log(`📄 Đang tải trang ${page}...`);
    const res = await fetch(
      `${TMDB_BASE}/movie/now_playing?api_key=${API_KEY}&language=vi-VN&page=${page}&region=VN`
    );
    const json = await res.json();

    if (!json.results) {
      console.warn(`⚠ Không nhận được dữ liệu từ trang ${page}`);
      break;
    }

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
          duration: detail.runtime || 0,
          country: detail.production_countries?.[0]?.name || "",
          genres: detail.genres?.map(g => g.name) || [],
          director: (detail.credits?.crew || []).find(c => c.job === "Director")?.name || "",
          releaseDate: detail.release_date || null,
          actors: (detail.credits?.cast || []).slice(0, 5).map(a => a.name),
          posterUrl: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : "",
          trailerUrl: toEmbedUrl(trailer?.key),
          description: detail.overview || "",
        });

      } catch (err) {
        console.error(`❌ Lỗi khi lấy chi tiết phim ID ${item.id}:`, err);
      }
    }

    page++;
  } while (page <= totalPages && page <= 5);

  return allMovies;
}

(async () => {
  try {
    const movies = await fetchNowPlaying();
    console.log(`✅ Tổng số phim lấy được: ${movies.length}`);
    console.log(JSON.stringify(movies, null, 2));
    // TODO: Lưu vào DB ở đây nếu cần
  } catch (err) {
    console.error("❌ Lỗi fetch:", err);
  }
})();
