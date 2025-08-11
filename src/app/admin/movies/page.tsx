"use client";
import React, { useState, useEffect } from "react";

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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [actors, setActors] = useState<string[]>([]);
  const [poster, setPoster] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/genres").then(res => res.json()).then(setGenres);
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    const res = await fetch("/api/admin/movies");
    setMovies(await res.json());
  };

  const handleGenreToggle = (id: string) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleActorAdd = (name: string) => {
    if (name.trim() && !actors.includes(name.trim())) {
      setActors(prev => [...prev, name.trim()]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return;
    await fetch(`/api/admin/movies/${id}`, { method: "DELETE" });
    fetchMovies();
  };

  const handleEdit = (movie: Movie) => {
    setEditingId(movie._id);
    setSelectedGenres(movie.genres.map(g => g._id));
    setActors(movie.actors);
    const form = document.getElementById("movieForm") as HTMLFormElement;
    (form.elements.namedItem("title") as HTMLInputElement).value = movie.title;
    (form.elements.namedItem("duration") as HTMLInputElement).value = String(movie.duration);
    (form.elements.namedItem("country") as HTMLSelectElement).value = movie.country;
    (form.elements.namedItem("ageLimit") as HTMLSelectElement).value = movie.ageLimit;
    (form.elements.namedItem("status") as HTMLSelectElement).value = movie.status;
    (form.elements.namedItem("director") as HTMLInputElement).value = movie.director;
    (form.elements.namedItem("releaseDate") as HTMLInputElement).value = movie.releaseDate?.slice(0,10);
    (form.elements.namedItem("endDate") as HTMLInputElement).value = movie.endDate?.slice(0,10);
    (form.elements.namedItem("trailerUrl") as HTMLInputElement).value = movie.trailerUrl || "";
    (form.elements.namedItem("description") as HTMLTextAreaElement).value = movie.description || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    formData.set("genres", JSON.stringify(selectedGenres));
    formData.set("actors", actors.join(","));
    if (poster) formData.set("poster", poster);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/movies/${editingId}` : "/api/admin/movies";

    const res = await fetch(url, { method, body: formData });
    if (res.ok) {
      alert(editingId ? "Cập nhật phim thành công!" : "Thêm phim thành công!");
      form.reset();
      setSelectedGenres([]);
      setActors([]);
      setPoster(null);
      setEditingId(null);
      fetchMovies();
    } else {
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Form thêm/sửa */}
      <div>
        <h1 className="text-xl font-bold mb-4">
          {editingId ? "Sửa Phim" : "Thêm Phim"}
        </h1>
        <form id="movieForm" onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <label>Tên phim</label>
            <input name="title" className="border p-2 w-full" required />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label>Thời lượng</label>
              <input type="number" name="duration" className="border p-2 w-full" required />
            </div>
            <div>
              <label>Quốc gia</label>
              <select name="country" className="border p-2 w-full">
                <option value="Việt Nam">Việt Nam</option>
                <option value="Mỹ">Mỹ</option>
                <option value="Nhật Bản">Nhật Bản</option>
                <option value="Hàn Quốc">Hàn Quốc</option>
                <option value="Châu Úc">Châu Úc</option>
              </select>
            </div>
            <div>
              <label>Giới hạn tuổi</label>
              <select name="ageLimit" className="border p-2 w-full">
                <option value="K">K</option>
                <option value="T13">T13</option>
                <option value="T18">T18</option>
                <option value="C18">C18</option>
              </select>
            </div>
            <div>
              <label>Trạng thái</label>
              <select name="status" className="border p-2 w-full">
                <option value="đang chiếu">Đang chiếu</option>
                <option value="sắp chiếu">Sắp chiếu</option>
                <option value="ngừng chiếu">Ngừng chiếu</option>
              </select>
            </div>
          </div>

          <div>
            <label>Thể loại</label>
            <div className="flex flex-wrap gap-2">
              {genres.map(g => (
                <button
                  type="button"
                  key={g._id}
                  className={`px-3 py-1 border rounded ${selectedGenres.includes(g._id) ? "bg-blue-500 text-white" : ""}`}
                  onClick={() => handleGenreToggle(g._id)}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label>Đạo diễn</label>
            <input name="director" className="border p-2 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Ngày phát hành</label>
              <input type="date" name="releaseDate" className="border p-2 w-full" />
            </div>
            <div>
              <label>Ngày kết thúc</label>
              <input type="date" name="endDate" className="border p-2 w-full" />
            </div>
          </div>

          <div>
            <label>Diễn viên</label>
            <div className="flex gap-2">
              <input type="text" id="actorInput" placeholder="Nhập tên" className="border p-2 flex-1" />
              <button type="button" className="bg-green-500 text-white px-4" onClick={() => {
                const input = document.getElementById("actorInput") as HTMLInputElement;
                handleActorAdd(input.value);
                input.value = "";
              }}>Thêm</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {actors.map((a, idx) => (
                <span key={idx} className="bg-gray-200 px-2 py-1 rounded">{a}</span>
              ))}
            </div>
          </div>

          <div>
            <label>Hình ảnh</label>
            <input type="file" accept="image/*" onChange={e => setPoster(e.target.files?.[0] || null)} />
          </div>

          <div>
            <label>Trailer</label>
            <input name="trailerUrl" className="border p-2 w-full" />
          </div>

          <div>
            <label>Mô tả</label>
            <textarea name="description" className="border p-2 w-full" rows={4}></textarea>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-6 py-2">
            {editingId ? "Cập nhật" : "Chấp nhận"}
          </button>
        </form>
      </div>

      {/* Danh sách */}
      <div>
        <h2 className="text-lg font-bold mt-8 mb-4">Danh sách phim</h2>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Poster</th>
              <th className="border p-2">Tên</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Quốc gia</th>
              <th className="border p-2">Thể loại</th>
              <th className="border p-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {movies.map(m => (
              <tr key={m._id}>
                <td className="border p-2">{m.posterUrl && <img src={m.posterUrl} className="w-16 h-24 object-cover" />}</td>
                <td className="border p-2">{m.title}</td>
                <td className="border p-2">{m.status}</td>
                <td className="border p-2">{m.country}</td>
                <td className="border p-2">{m.genres?.map(g => g.name).join(", ")}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleEdit(m)} className="bg-yellow-500 text-white px-3 py-1">Sửa</button>
                  <button onClick={() => handleDelete(m._id)} className="bg-red-500 text-white px-3 py-1">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
