"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Movie {
  _id: string;
  title: string;
  posterUrl: string;
  releaseDate: string;
  genres: string[];
}

export default function AdminMoviesPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);

  // Lấy danh sách phim trong DB khi load trang
  async function fetchMovies() {
    const res = await fetch("/api/admin/movies/list");
    const data = await res.json();
    if (res.ok) setMovies(data.movies);
  }

  useEffect(() => {
    fetchMovies();
  }, []);

  // Đồng bộ phim mới
  async function handleSync(months = 1) {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/movies/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Sync failed");
      setMsg(`Đã đồng bộ: ${data.saved}/${data.totalFiltered} phim (tổng lấy: ${data.totalFetched})`);
      fetchMovies(); // Lấy lại list mới
    } catch (e) {
      setMsg(`Lỗi: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  // Xóa phim
  async function handleDelete(id: string) {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return;
    const res = await fetch("/api/admin/movies/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data.ok) {
      setMovies(movies.filter((m) => m._id !== id));
    } else {
      alert(data.error || "Xóa thất bại");
    }
  }

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Quản lý phim</h1>
      <div className="flex gap-2">
        <button
          onClick={() => handleSync(1)}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {loading ? "Đang đồng bộ..." : "Đồng bộ 1 tháng gần đây"}
        </button>
        <button
          onClick={() => handleSync(3)}
          disabled={loading}
          className="px-4 py-2 rounded bg-slate-700 text-white disabled:opacity-50"
        >
          {loading ? "..." : "Đồng bộ 3 tháng"}
        </button>
      </div>
      {msg && <p className="text-sm">{msg}</p>}

      {/* Danh sách phim */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
        {movies.map((movie) => (
          <div key={movie._id} className="bg-gray-800 text-white rounded p-2">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={200}
              height={300}
              className="rounded"
            />
            <h2 className="font-bold mt-2">{movie.title}</h2>
            <p className="text-sm">{new Date(movie.releaseDate).toLocaleDateString()}</p>
            <p className="text-xs text-gray-300">{movie.genres.join(", ")}</p>
            <button
              onClick={() => handleDelete(movie._id)}
              className="mt-2 w-full py-1 bg-red-600 rounded text-white hover:bg-red-700"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
