import axios from "axios";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export async function getNowPlayingMoviesVN(page = 1) {
  const url = `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=vi-VN&page=${page}`;
  const res = await axios.get(url);
  return res.data.results;
}

export async function getMovieDetails(id) {
  const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=vi-VN&append_to_response=videos`;
  const res = await axios.get(url);
  return res.data;
}
