// scripts/fetchNowPlaying.js
// Chạy: node scripts/fetchNowPlaying.js
// Yêu cầu: Node >= 18 (có fetch), hoặc cài `node-fetch`

const API_KEY = process.env.TMDB_API_KEY; // đặt trong .env
const TMDB_BASE = "https://api.themoviedb.org/3";

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
      // Lấy chi tiết + trailer
      const detailRes = await fetch(`${TMDB_BASE}/movie/${item.id}?api_key=${API_KEY}&language=vi-VN&append_to_response=videos,credits`);
      const detail = await detailRes.json();

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
  } while (page <= totalPages && page <= 5); // giới hạn 5 trang để tránh quá lâu

  return allMovies;
}

(async () => {
  try {
    const movies = await fetchNowPlaying();
    console.log("Tổng số phim:", movies.length);
    console.log(JSON.stringify(movies, null, 2));
    // Ở đây bạn có thể lưu vào DB nếu muốn
  } catch (err) {
    console.error("Lỗi fetch:", err);
  }
})();
