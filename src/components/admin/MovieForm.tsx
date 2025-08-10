"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Genre = { _id: string; name: string };
type Movie = {
  _id?: string;
  title: string;
  genre: string;
  duration: number;
  releaseDate: string;
};

export default function MovieForm({ movie }: { movie?: Movie }) {
  const [form, setForm] = useState<Movie>({
    title: movie?.title || "",
    genre: movie?.genre || "",
    duration: movie?.duration || 0,
    releaseDate: movie?.releaseDate ? movie.releaseDate.slice(0, 10) : "",
  });
  const [genres, setGenres] = useState<Genre[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const method = movie?._id ? "PUT" : "POST";
    const url = movie?._id ? `/api/movies/${movie._id}` : `/api/movies`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/admin/movies");
    } else {
      alert("Có lỗi xảy ra!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      <div>
        <label className="block font-medium">Tên phim</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Thể loại</label>
        <select
          name="genre"
          value={form.genre}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        >
          <option value="">-- Chọn thể loại --</option>
          {genres.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Thời lượng (phút)</label>
        <input
          type="number"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block font-medium">Ngày phát hành</label>
        <input
          type="date"
          name="releaseDate"
          value={form.releaseDate}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {movie ? "Cập nhật" : "Thêm mới"}
      </button>
    </form>
  );
}
