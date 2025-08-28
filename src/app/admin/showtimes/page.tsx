"use client";

import { useEffect, useState } from "react";

interface Movie {
  _id: string;
  title: string;
}

interface Showtime {
  _id: string;
  movie: Movie;
  startTime: string;
  room: string;
}

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [form, setForm] = useState({ movie: "", startTime: "", room: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Lấy danh sách showtimes
  const fetchShowtimes = async () => {
    const res = await fetch("/api/showtimes");
    const data = await res.json();
    setShowtimes(data);
  };

  // Lấy danh sách phim
  const fetchMovies = async () => {
    const res = await fetch("/api/movies");
    const data = await res.json();
    setMovies(data);
  };

  useEffect(() => {
    fetchShowtimes();
    fetchMovies();
  }, []);

  // Thêm hoặc chỉnh sửa
  const saveShowtime = async () => {
    if (!form.movie || !form.startTime || !form.room) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/showtimes/${editingId}` : "/api/showtimes";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setForm({ movie: "", startTime: "", room: "" });
    setEditingId(null);
    fetchShowtimes();
  };

  // Xoá suất chiếu
  const deleteShowtime = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xoá suất chiếu này?")) return;
    await fetch(`/api/showtimes/${id}`, { method: "DELETE" });
    fetchShowtimes();
  };

  // Chuẩn bị edit
  const editShowtime = (s: Showtime) => {
    setForm({
      movie: s.movie?._id || "",
      startTime: s.startTime ? s.startTime.slice(0, 16) : "",
      room: s.room || "",
    });
    setEditingId(s._id);
  };

  // Cancel edit
  const cancelEdit = () => {
    setForm({ movie: "", startTime: "", room: "" });
    setEditingId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quản lý Suất Chiếu</h1>

      {/* Form thêm/chỉnh sửa */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <select
          value={form.movie || ""}
          onChange={(e) => setForm({ ...form, movie: e.target.value })}
          className="border px-2 py-1"
        >
          <option value="">Chọn phim</option>
          {movies.map((m) => (
            <option key={m._id} value={m._id}>
              {m.title}
            </option>
          ))}
        </select>

        <input
          type="datetime-local"
          value={form.startTime || ""}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          className="border px-2 py-1"
        />

        <input
          type="text"
          placeholder="Phòng chiếu"
          value={form.room || ""}
          onChange={(e) => setForm({ ...form, room: e.target.value })}
          className="border px-2 py-1"
        />

        <button
          onClick={saveShowtime}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Cập nhật" : "Thêm"}
        </button>

        {editingId && (
          <button
            onClick={cancelEdit}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Huỷ
          </button>
        )}
      </div>

      {/* Danh sách showtimes */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2">Phim</th>
            <th className="border px-2">Ngày giờ chiếu</th>
            <th className="border px-2">Phòng</th>
            <th className="border px-2">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {showtimes.map((s) => (
            <tr key={s._id}>
              <td className="border px-2">{s.movie?.title}</td>
              <td className="border px-2">
                {s.startTime
                  ? new Date(s.startTime).toLocaleString("vi-VN")
                  : "Chưa có"}
              </td>
              <td className="border px-2">{s.room}</td>
              <td className="border px-2 flex gap-2">
                <button
                  onClick={() => editShowtime(s)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteShowtime(s._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Xoá
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
