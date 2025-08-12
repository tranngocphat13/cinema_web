"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { PlayCircle } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Movie {
  _id: string;
  title: string;
  releaseDate: string;
  posterUrl: string;
  trailerUrl?: string;
  ratingLabel?: string; // VD: T13, T16, K
}

export default function NowPlayingSlider() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrailer, setSelectedTrailer] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch("/api/movies/now-playing");
        const data = await res.json();
        if (data.success) setMovies(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  if (loading) return <p>Đang tải phim...</p>;

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-500 uppercase text-center">
        PHIM ĐANG CHIẾU
      </h1>

      <Swiper spaceBetween={20} slidesPerView={4}>
        {movies.map((movie) => (
          <SwiperSlide key={movie._id}>
            <MovieCard movie={movie} onWatchTrailer={setSelectedTrailer} />
          </SwiperSlide>
        ))}
      </Swiper>

      {selectedTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden relative">
            <button
              className="absolute top-2 right-3 text-white text-2xl font-bold"
              onClick={() => setSelectedTrailer(null)}
            >
              ✕
            </button>
            <ReactPlayer
            //   url={selectedTrailer}
              controls
              playing
              width="100%"
              height="500px"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MovieCard({
  movie,
  onWatchTrailer,
}: {
  movie: Movie;
  onWatchTrailer: (url: string) => void;
}) {
  return (
    <div className="bg-[#12192e] text-white rounded-lg overflow-hidden shadow-lg flex flex-col">
      <div className="relative w-full pb-[150%] overflow-hidden rounded-lg">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {movie.ratingLabel && (
          <div className="absolute top-2 left-2 bg-red-600 text-white font-bold text-xs px-2 py-1 rounded">
            {movie.ratingLabel}
          </div>
        )}
      </div>

      <div className="p-2 flex flex-col gap-2">
        <h3 className="text-sm font-semibold uppercase line-clamp-2">{movie.title}</h3>
        <div className="flex gap-2">
          {movie.trailerUrl && (
            <button
              onClick={() => onWatchTrailer(movie.trailerUrl!)}
              className="flex-1 flex items-center justify-center gap-1 border border-gray-400 hover:bg-gray-700 text-gray-300 text-xs py-1 rounded"
            >
              <PlayCircle className="w-4 h-4" /> Xem Trailer
            </button>
          )}
          <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs py-1 rounded">
            Đặt Vé
          </button>
        </div>
      </div>
    </div>
  );
}
