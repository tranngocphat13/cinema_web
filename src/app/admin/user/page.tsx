"use client";

import { useEffect, useState } from "react";

type User = { 
  _id: string; 
  name: string; 
  email: string; 
  role: string; 
  isVerified: boolean 
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/user");
      if (!res.ok) throw new Error("Không thể tải danh sách users");
      const data = await res.json();
      setUsers(data.users || []);
    } catch  {
      setError("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (id: string, role: string) => {
    try {
      const res = await fetch("/api/admin/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, role }),
      });
      if (!res.ok) throw new Error("Cập nhật thất bại");
      setMessage("Cập nhật quyền thành công!");
      fetchUsers();
    } catch  {
      setError("Có lỗi xảy ra");
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    try {
      const res = await fetch(`/api/admin/user?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Xóa thất bại");
      setMessage("Xóa user thành công!");
      fetchUsers();
    } catch  {
      setError("Có lỗi xảy ra");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Quản lý tài khoản</h1>

      {message && <p className="mb-4 text-green-600">{message}</p>}
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Tên</th>
              <th className="text-left">Email</th>
              <th className="text-left">Role</th>
              <th className="text-left">Trạng thái</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50">
                <td className="p-2">{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u._id, e.target.value)}
                    className="border rounded p-1"
                  >
                    <option value="Customer">Customer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td>{u.isVerified ? "✅ Xác thực" : "❌ Chưa xác thực"}</td>
                <td className="text-center">
                  <button
                    onClick={() => removeUser(u._id)}
                    className="text-red-500 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  Không có user nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
