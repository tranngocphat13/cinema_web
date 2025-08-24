"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

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

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch("/api/admin/movies");
    setMovies(await res.json());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return;
    await fetch(`/api/admin/movies/${id}`, { method: "DELETE" });
    fetchMovies();
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-lg font-bold mb-4">Danh sách phim</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Poster</th>
            <th className="border p-2">Tên</th>
            <th className="border p-2">Trạng thái</th>
            <th className="border p-2">Quốc gia</th>
            <th className="border p-2">Thể loại</th>
            <th className="border p-2">Trailer</th>
            <th className="border p-2">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((m) => (
            <tr key={m._id}>
              <td className="border p-2">
                {m.posterUrl && (
                  <Image src={m.posterUrl} alt={m.title} width={64} height={96} />
                )}
              </td>
              <td className="border p-2">{m.title}</td>
              <td className="border p-2">{m.status}</td>
              <td className="border p-2">{m.country}</td>
              <td className="border p-2">{m.genres?.map((g) => g.name).join(", ")}</td>
              <td className="border p-2">
                {m.trailerUrl ? (
                  <a
                    href={m.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Xem Trailer
                  </a>
                ) : (
                  <span className="text-gray-500">Không có trailer</span>
                )}
              </td>
              <td className="border p-2">
                <button
                  onClick={() => handleDelete(m._id)}
                  className="bg-red-500 text-white px-3 py-1"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
