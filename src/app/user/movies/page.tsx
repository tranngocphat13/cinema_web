"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Genre {
  _id: string;
  name: string;
}

interface Movie {
  _id: string;
  title: string;
  duration: number;
  country: string;
  genres: Genre[];
  director: string;
  releaseDate: string;
  endDate: string;
  ageLimit: string;
  actors: string[];
  status: string;
  posterUrl?: string;
  trailerUrl?: string;
  description?: string;
}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterGenre, setFilterGenre] = useState<string>("all");
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    fetch("/api/admin/movies")
      .then((res) => res.json())
      .then(setMovies);
    fetch("/api/admin/genres")
      .then((res) => res.json())
      .then(setGenres);
  }, []);

  const filteredMovies = movies.filter((movie) => {
    return (
      (filterStatus === "all" || movie.status === filterStatus) &&
      (filterGenre === "all" || movie.genres.some((g) => g._id === filterGenre))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">Danh sách phim</h1>

      {/* Bộ lọc */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="đang chiếu">Đang chiếu</option>
          <option value="sắp chiếu">Sắp chiếu</option>
          <option value="ngừng chiếu">Ngừng chiếu</option>
        </select>

        <select
          value={filterGenre}
          onChange={(e) => setFilterGenre(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">Tất cả thể loại</option>
          {genres.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      {/* Danh sách phim */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredMovies.length > 0 ? (
          filteredMovies.map((movie) => (
            <div
              key={movie._id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {movie.posterUrl && (
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-lg font-bold">{movie.title}</h2>
                <p className="text-sm text-gray-500">
                  {movie.genres.map((g) => g.name).join(", ")}
                </p>
                <p className="text-sm mt-1">⏱ {movie.duration} phút</p>
                <p
                  className={`text-sm mt-1 font-semibold ${
                    movie.status === "đang chiếu"
                      ? "text-green-600"
                      : movie.status === "sắp chiếu"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {movie.status}
                </p>
                <div className="mt-4 flex gap-2">
                  {movie.status === "đang chiếu" && (
                    <Link
                      href={`/booking?movie=${movie._id}`}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                    >
                      Đặt vé
                    </Link>
                  )}
                  <Link
                    href={`/movies/${movie._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Không có phim phù hợp.</p>
        )}
      </div>
    </div>
  );
}
