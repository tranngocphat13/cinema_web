import axios from "axios";
import Movie from "@/models/movie";
import connectDB from "@/lib/mongodb";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function syncMovies() {
  await connectDB();

  try {
    const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=vi-VN&region=VN&page=1`;
    const res = await axios.get(url);

    console.log("API URL gọi tới:", url);
    console.log("Dữ liệu TMDB trả về:", res.data); // Kiểm tra có results không?

    const movies = res.data.results;
    if (!movies || movies.length === 0) {
      console.log("Không có phim nào trong TMDB (region=VN)!");
      return;
    }

    for (const movie of movies) {
      await Movie.updateOne(
        { tmdbId: movie.id },
        {
          tmdbId: movie.id,
          title: movie.title,
          overview: movie.overview,
          releaseDate: movie.release_date,
          posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        },
        { upsert: true }
      );
    }

    console.log(`Đồng bộ thành công ${movies.length} phim!`);
  } catch (error) {
    console.error("Lỗi đồng bộ phim:", error.message);
  }
}
