import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import {
  getGenreMap,
  getNowPlayingPages,
  getMovieDetail,
  getMovieVideos,
  getVNReleaseCertification,
} from "@/lib/tmdb";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function syncNowPlaying({ months = 1 } = {}) {
  await connectDB();

  // 1) Lấy danh sách Now Playing theo trang
  const list = await getNowPlayingPages({ region: "VN", language: "vi-VN", maxPages: 5 });

  // 2) Lọc theo thời gian 1 tháng gần đây
  const today = new Date();
  const from = new Date(today);
  from.setMonth(today.getMonth() - months);

  const filtered = (list || []).filter((m) => {
    if (!m.release_date) return false;
    const d = new Date(m.release_date);
    return d >= from;
  });

  // 3) Map genre id -> name (để lưu mảng string)
  const genreMap = await getGenreMap("vi-VN");

  // 4) Lấy chi tiết + video cho từng phim (giới hạn concurrency)
  let saved = 0;
  const batches = chunk(filtered, 5); // 5 phim/lần để tránh rate limit
  for (const group of batches) {
    await Promise.all(
      group.map(async (m) => {
        try {
          const [detail, videos, ratingLabel] = await Promise.all([
            getMovieDetail(m.id, "vi-VN"),
            getMovieVideos(m.id, "vi-VN"),
            getVNReleaseCertification(m.id).catch(() => ""), // có thể không có
          ]);

          const trailer = (videos.results || []).find(
            (v) => v.type === "Trailer" && v.site === "YouTube"
          );

          const genres =
            detail.genres?.map((g) => g.name) ||
            (m.genre_ids || []).map((id) => genreMap.get(id)).filter(Boolean);

          // Tính status đơn giản (vì lấy from now-playing)
          const status = "now_playing";

          const doc = {
            tmdbId: detail.id,
            title: detail.title,
            overview: detail.overview,
            genres,
            posterUrl: detail.poster_path
              ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
              : "",
            backdropUrl: detail.backdrop_path
              ? `https://image.tmdb.org/t/p/w780${detail.backdrop_path}`
              : "",
            trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
            releaseDate: detail.release_date ? new Date(detail.release_date) : null,
            status,
            runtime: detail.runtime || null,
            ratingLabel: ratingLabel || "",
            countries: detail.production_countries?.map((c) => c.iso_3166_1) || [],
          };

          await Movie.updateOne({ tmdbId: detail.id }, { $set: doc }, { upsert: true });
          saved += 1;
        } catch (e) {
          console.error("[sync movie error]", m.id, e.message);
        }
      })
    );
    // nhẹ nhàng chờ 250ms giữa các batch để đỡ rate-limit
    await new Promise((r) => setTimeout(r, 250));
  }

  return { totalFetched: list.length, totalFiltered: filtered.length, saved };
}
