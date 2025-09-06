"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// ==== Interfaces ====
interface Movie {
  _id: string;
  title: string;
  runtime: number;
}

interface Cinema {
  _id: string;
  name: string;
}

interface Room {
  _id: string;
  name: string;
}

interface Showtime {
  _id: string;
  movie: Movie;
  cinema: Cinema;
  room: Room;
  startTime: string;
  endTime: string;
}

export default function AdminShowtimesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  const [selectedMovie, setSelectedMovie] = useState<string>("");
  const [selectedCinema, setSelectedCinema] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");

  const [editingId, setEditingId] = useState<string | null>(null);

  // === Lấy dữ liệu ban đầu ===
  useEffect(() => {
    const fetchData = async () => {
      const resMovies = await fetch("/api/movies");
      setMovies(await resMovies.json());

      const resCinemas = await fetch("/api/cinemas");
      setCinemas(await resCinemas.json());

      const resShowtimes = await fetch("/api/showtimes");
      setShowtimes(await resShowtimes.json());
    };
    fetchData();
  }, []);

  // === Tự động tính endTime khi chọn phim và startTime ===
  useEffect(() => {
    if (!selectedMovie || !startTime) return;

    const movie = movies.find((m) => m._id === selectedMovie);
    if (movie?.runtime) {
      const start = new Date(startTime);
      if (!isNaN(start.getTime())) {
        const end = new Date(start.getTime() + movie.runtime * 60000);
        const local = new Date(end.getTime() - end.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setEndTime(local);
      }
    }
  }, [selectedMovie, startTime, movies]);

  // === Lấy danh sách phòng trống ===
  const fetchAvailableRooms = async () => {
    if (!selectedCinema || !startTime || !endTime) return;

    const payload = {
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
    };

    const res = await fetch(`/api/cinemas/${selectedCinema}/rooms/free`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setRooms(await res.json());
    } else {
      setRooms([]);
    }
  };

  // === Reset form ===
  const resetForm = () => {
    setSelectedMovie("");
    setSelectedCinema("");
    setSelectedRoom("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
  };

  // === Tạo mới hoặc cập nhật suất chiếu ===
  const handleSaveShowtime = async () => {
    if (!selectedMovie || !selectedCinema || !selectedRoom || !startTime) {
      return alert("Vui lòng nhập đủ thông tin");
    }

    const payload = {
      movieId: selectedMovie,
      cinemaId: selectedCinema,
      roomId: selectedRoom,
      startTime: new Date(startTime).toISOString(),
    };

    let res: Response;
    if (editingId) {
      res = await fetch(`/api/showtimes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/showtimes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      const updated: Showtime = await res.json();
      if (editingId) {
        setShowtimes((prev) =>
          prev.map((s) => (s._id === updated._id ? updated : s))
        );
        alert("✅ Cập nhật suất chiếu thành công");
      } else {
        setShowtimes((prev) => [...prev, updated]);
        alert("✅ Tạo suất chiếu thành công");
      }
      resetForm();
    } else {
      let errorMsg = "Không rõ lỗi";
      try {
        errorMsg = (await res.json()).error || errorMsg;
      } catch {}
      alert("❌ Lỗi: " + errorMsg);
    }
  };

  // === Chỉnh sửa suất chiếu ===
  const handleEdit = (s: Showtime) => {
    setEditingId(s._id);
    setSelectedMovie(s.movie?._id || "");
    setSelectedCinema(s.cinema?._id || "");
    setSelectedRoom(s.room?._id || "");

    const start = new Date(s.startTime);
    const end = new Date(s.endTime);

    if (!isNaN(start.getTime())) {
      setStartTime(start.toISOString().slice(0, 16));
    } else {
      setStartTime("");
    }

    if (!isNaN(end.getTime())) {
      setEndTime(end.toISOString().slice(0, 16));
    } else {
      setEndTime("");
    }
  };

  // === Xóa suất chiếu ===
  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa suất chiếu này?")) return;
    const res = await fetch(`/api/showtimes/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShowtimes((prev) => prev.filter((s) => s._id !== id));
      alert("🗑️ Đã xóa suất chiếu");
    } else {
      alert("❌ Lỗi khi xóa suất chiếu");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">🎬 Quản lý suất chiếu</h1>

      {/* Form thêm/sửa */}
      <div className="space-y-3 border p-4 rounded bg-gray-50">
        <h2 className="font-semibold">
          {editingId ? "✏️ Sửa suất chiếu" : "➕ Thêm suất chiếu"}
        </h2>

        {/* Chọn phim */}
        <div>
          <label className="block mb-1">Phim</label>
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title} ({m.runtime} phút)
              </option>
            ))}
          </select>
        </div>

        {/* Chọn rạp */}
        <div>
          <label className="block mb-1">Rạp</label>
          <select
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">-- Chọn rạp --</option>
            {cinemas.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn giờ bắt đầu */}
        <div>
          <label className="block mb-1">Giờ bắt đầu</label>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>

        {/* Giờ kết thúc */}
        {endTime && (
          <div>
            <label className="block mb-1">Giờ kết thúc</label>
            <input
              type="datetime-local"
              value={endTime}
              readOnly
              className="border p-2 rounded w-full bg-gray-100"
            />
          </div>
        )}

        {/* Kiểm tra phòng */}
        <Button
          onClick={fetchAvailableRooms}
          disabled={!selectedCinema || !endTime}
        >
          Kiểm tra phòng trống
        </Button>

        {/* Chọn phòng */}
        {rooms.length > 0 && (
          <div>
            <label className="block mb-1">Phòng</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex gap-2">
          <Button onClick={handleSaveShowtime}>
            {editingId ? "Cập nhật" : "Tạo suất chiếu"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Hủy
            </Button>
          )}
        </div>
      </div>

      {/* Danh sách suất chiếu */}
      <div>
        <h2 className="text-xl font-semibold">📅 Danh sách suất chiếu</h2>
        {showtimes.length === 0 ? (
          <p className="text-gray-500">Chưa có suất chiếu nào</p>
        ) : (
          <ul className="space-y-2 mt-2">
            {showtimes.map((s) => (
              <li
                key={s._id}
                className="border p-3 rounded shadow-sm bg-white flex justify-between items-center"
              >
                <div>
                  🎥 <strong>{s.movie?.title || "N/A"}</strong> <br />
                  🏢 {s.cinema?.name || "N/A"} - {s.room?.name || "N/A"} <br />
                  🕒{" "}
                  {s.startTime
                    ? new Date(s.startTime).toLocaleString()
                    : "N/A"}{" "}
                  → {s.endTime ? new Date(s.endTime).toLocaleString() : "N/A"}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(s)}>Sửa</Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(s._id)}
                  >
                    Xóa
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
