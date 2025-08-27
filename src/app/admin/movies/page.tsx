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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [msg, setMsg] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function fetchMovies() {
    try {
      const res = await fetch("/api/admin/movies/list");
      const data = await res.json();
      if (res.ok) setMovies(data.movies);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setMsg("Không thể tải danh sách phim");
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);

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
      setMsg(`Đã đồng bộ: ${data.saved}/${data.totalFiltered} phim`);
      fetchMovies();
    } catch (e) {
      setMsg(`Lỗi: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/admin/movies/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      });
      const data = await res.json();
      if (data.ok) {
        setMovies(movies.filter((m) => m._id !== deleteId));
        setMsg("Xóa thành công!");
      } else {
        setMsg(data.error || "Xóa thất bại");
      }
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quản lý phim</h1>
        <div className="flex gap-2">
          <button
            onClick={() => handleSync(1)}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : null}
            1 tháng
          </button>
          <button
            onClick={() => handleSync(3)}
            disabled={loading}
            className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
          >
            3 tháng
          </button>
        </div>
      </header>

      {msg && <p className="text-sm text-green-400">{msg}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="bg-gray-900 text-white rounded shadow hover:shadow-lg transition p-2 flex flex-col"
          >
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded object-cover"
            />
            <h2 className="font-semibold mt-2 line-clamp-2">{movie.title}</h2>
            <p className="text-xs text-gray-400">{new Date(movie.releaseDate).toLocaleDateString()}</p>
            <p className="text-xs text-gray-400 mb-2">{movie.genres.join(", ")}</p>
            <button
              onClick={() => setDeleteId(movie._id)}
              className="mt-auto py-1 bg-red-600 rounded hover:bg-red-700 text-sm"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      {/* Modal Xác nhận Xóa */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-lg font-bold mb-4">Xác nhận xóa?</h3>
            <p className="text-gray-700 mb-4">Bạn có chắc chắn muốn xóa phim này?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
