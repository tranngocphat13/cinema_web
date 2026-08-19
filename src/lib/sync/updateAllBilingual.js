import dotenv from "dotenv";
dotenv.config();

import connectDB from "../mongodb.js";
import Movie from "../../models/movies.js";
import { getNowPlayingPages } from "../tmdb.js";

async function main() {
  await connectDB();

  console.log("Fetching TMDB now playing movies...");
  const list = await getNowPlayingPages({ region: "VN", language: "vi-VN", maxPages: 4 });
  console.log(`Fetched ${list.length} movies from TMDB.`);

  for (const m of list) {
    const titleVi = m.title || m.original_title;
    const titleEn = m.original_title || m.title;

    await Movie.updateOne(
      { tmdbId: m.id },
      {
        $set: {
          tmdbId: m.id,
          title: titleVi,
          titleEn: titleEn,
          originalTitle: m.original_title || m.title,
          overview: m.overview || "",
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "",
          backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
          releaseDate: m.release_date ? new Date(m.release_date) : null,
          status: "now_playing",
        },
      },
      { upsert: true }
    );
  }

  console.log("✅ Successfully updated all movies with bilingual titles!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
