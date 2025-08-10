"use client";

import { useEffect, useState } from "react";
interface Genre {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GenrePage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [newGenre, setNewGenre] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  // Lấy danh sách thể loại
  const fetchGenres = async () => {
    const res = await fetch("/api/admin/genres");
    const data = await res.json();
    setGenres(data);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Thêm thể loại
  const addGenre = async () => {
    const res = await fetch("/api/admin/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGenre }),
    });
    if (res.ok) {
      setNewGenre("");
      fetchGenres();
    }
  };

  // Cập nhật thể loại
  const updateGenre = async (id: string) => {
    const res = await fetch(`/api/admin/genres/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditId(null);
      setEditName("");
      fetchGenres();
    }
  };

  // Xóa thể loại
  const deleteGenre = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa?")) {
      await fetch(`/api/admin/genres/${id}`, { method: "DELETE" });
      fetchGenres();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📂 Quản lý thể loại</h1>

      {/* Form thêm thể loại */}
      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded w-64"
          placeholder="Tên thể loại mới..."
          value={newGenre}
          onChange={(e) => setNewGenre(e.target.value)}
        />
        <button
          onClick={addGenre}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm
        </button>
      </div>

      {/* Danh sách thể loại */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2 border">Tên thể loại</th>
            <th className="p-2 border">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((g) => (
            <tr key={g._id}>
              <td className="p-2 border">
                {editId === g._id ? (
                  <input
                    className="border p-1"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  g.name
                )}
              </td>
              <td className="p-2 border">
                {editId === g._id ? (
                  <button
                    onClick={() => updateGenre(g._id)}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Lưu
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditId(g._id);
                      setEditName(g.name);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                  >
                    Sửa
                  </button>
                )}
                <button
                  onClick={() => deleteGenre(g._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
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
