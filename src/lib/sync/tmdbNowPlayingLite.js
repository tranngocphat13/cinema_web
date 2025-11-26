import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";
import { getNowPlayingPages } from "@/lib/tmdb";

export default async function syncNowPlayingLite({
  region = "VN",
  language = "vi-VN",
  maxPages = Number(process.env.TMDB_MAX_PAGES || 3),
} = {}) {
  await connectDB();

  const list = await getNowPlayingPages({ region, language, maxPages });
  const ids = (list || []).map((m) => m.id).filter(Boolean);

  // 1) Những phim trước đây "now_playing" nhưng không còn trong list -> ended
  if (ids.length > 0) {
    await Movie.updateMany(
      { status: "now_playing", tmdbId: { $nin: ids } },
      { $set: { status: "ended" } }
    );
  }

  // 2) Upsert list hiện tại -> now_playing
  const ops = (list || []).map((m) => ({
    updateOne: {
      filter: { tmdbId: m.id },
      update: {
        $set: {
          tmdbId: m.id,
          title: m.title,
          overview: m.overview || "",
          posterUrl: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "",
          backdropUrl: m.backdrop_path
            ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}`
            : "",
          releaseDate: m.release_date ? new Date(m.release_date) : null,
          status: "now_playing",
        },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await Movie.bulkWrite(ops, { ordered: false });
  }

  return { fetched: list?.length || 0, updated: ops.length };
}
