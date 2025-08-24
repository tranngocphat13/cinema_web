"use client";

import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
import { PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";

// const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

interface Movie {
  _id: string;
  title: string;
  releaseDate: string;
  posterUrl: string;
  trailerUrl?: string;
  ratingLabel?: string;
}

export default function NowPlayingMovies() {
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

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-green-500 uppercase">
        🎬 Phim đang chiếu
      </h1>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 animate-pulse rounded-lg h-[420px]"
            ></div>
          ))}
        </div>
      )}

      {/* Movie Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onWatchTrailer={(url) => setSelectedTrailer(url)}
            />
          ))}
        </div>
      )}

      {/* Trailer Modal */}
      {selectedTrailer && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden relative">
            <button
              className="absolute top-2 right-3 text-white text-2xl font-bold"
              onClick={() => setSelectedTrailer(null)}
            >
              ✕
            </button>
            {/* <ReactPlayer url={selectedTrailer} controls playing width="100%" height="500px" /> */}
          </div>
        </div>
      )}
    </div>
  );
}

interface MovieCardProps {
  movie: Movie;
  onWatchTrailer: (url: string) => void;
}

function MovieCard({ movie, onWatchTrailer }: MovieCardProps) {
  return (
    <div className="bg-[#12192e] text-white rounded-lg overflow-hidden shadow-lg group flex flex-col relative">
      {/* Poster */}
      <div className="relative w-full pb-[150%] overflow-hidden">
        <Image
          src={movie.posterUrl || "/fallback-poster.jpg"}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="absolute inset-0 object-cover transition-transform group-hover:scale-105"
        />

        {movie.ratingLabel && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white font-bold text-xs px-2 py-1 rounded">
            {movie.ratingLabel}
          </div>
        )}

        {/* Hover Xem chi tiết */}
        <Link
          href={`/movies/${movie._id}`}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-lg transition"
        >
          Xem chi tiết
        </Link>
      </div>

      {/* Title + Buttons */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h2 className="text-sm font-bold uppercase line-clamp-2">
          {movie.title}
        </h2>

        <div className="mt-3 flex gap-2">
          {movie.trailerUrl && (
            <button
              onClick={() => onWatchTrailer(movie.trailerUrl!)}
              className="flex-1 flex items-center justify-center gap-1 border border-blue-400 hover:bg-blue-500 hover:text-white text-blue-400 text-sm py-2 rounded transition"
            >
              <PlayCircle className="w-4 h-4" /> Trailer
            </button>
          )}
          <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-2 rounded transition">
            Đặt Vé
          </button>
        </div>
      </div>
    </div>
  );
}
