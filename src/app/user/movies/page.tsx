// app/movies/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Movie = {
  _id: string;
  title: string;
  posterUrl: string;
  releaseDate: string;
  overview: string;
  status: "now_playing" | "upcoming";
  trailerUrl?: string;
  country: string;
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/movies")
      .then(res => res.json())
      .then(data => setMovies(data));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🎬 Phim Đang Chiếu & Sắp Chiếu</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map(movie => (
          <div key={movie._id} className="bg-white shadow-lg rounded-2xl overflow-hidden flex flex-col">
            <Image src={movie.posterUrl} alt={movie.title} className="w-full h-72 object-cover" width={300} height={450}/>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-lg mb-2 line-clamp-2">{movie.title}</h2>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">{movie.overview}</p>
              <p className="text-sm text-gray-500 mb-4">Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</p>
              <div className="mt-auto flex gap-2">
                <Link
                  href={`/movies/${movie._id}`}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-xl text-center hover:bg-blue-700"
                >
                  Đặt Vé
                </Link>
                {movie.trailerUrl && (
                  <button
                    onClick={() => window.open(movie.trailerUrl, "_blank")}
                    className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
                  >
                    <PlayCircle />
                  </button>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 text-sm text-white ${movie.status === "now_playing" ? "bg-green-600" : "bg-yellow-500"}`}>
              {movie.status === "now_playing" ? "Đang Chiếu" : "Sắp Chiếu"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
