"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Movie = {
  _id: string;
  title: string;
  posterUrl: string;
  type: "now_playing" | "upcoming";
};

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => setMovies(data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Phim Đang Chiếu & Sắp Chiếu</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
            <Image src={movie.posterUrl} alt={movie.title} className="w-full h-60 object-cover rounded-lg" width={500} height={750} />
            <h2 className="mt-2 text-lg font-bold">{movie.title}</h2>
            <p className="text-sm text-gray-400">{movie.type === "now_playing" ? "Đang chiếu" : "Sắp chiếu"}</p>
            <Link href={`/movies/${movie._id}`}>
              <button className="mt-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm">Xem chi tiết</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
