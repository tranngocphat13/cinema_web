"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Room {
  _id: string;
  name: string;
}

interface AdminRoomsPageProps {
  params: Promise<{ cinemaId: string }>; // ✅ params là Promise
}

export default function AdminRoomsPage({ params }: AdminRoomsPageProps) {
  // ✅ unwrap Promise bằng use()
  const { cinemaId } = use(params);
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoom, setNewRoom] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cinemas/${cinemaId}/rooms`);
      if (!res.ok) throw new Error("Không thể tải danh sách phòng");
      const data: Room[] = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Lỗi khi tải phòng:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, [cinemaId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoom = async () => {
    if (!newRoom.trim()) return;
    try {
      const res = await fetch(`/api/cinemas/${cinemaId}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRoom }),
      });
      if (!res.ok) throw new Error("Thêm phòng thất bại");
      setNewRoom("");
      fetchRooms();
    } catch (err) {
      console.error("Lỗi khi thêm phòng:", err);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/cinemas/${cinemaId}/rooms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Xóa phòng thất bại");
      fetchRooms();
    } catch (err) {
      console.error("Lỗi khi xóa phòng:", err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý phòng chiếu</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Tên phòng"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <Button onClick={handleAddRoom}>+ Thêm</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : rooms.length === 0 ? (
        <p className="text-gray-500">Chưa có phòng nào.</p>
      ) : (
        <ul className="space-y-2">
          {rooms.map((room) => (
            <li
              key={room._id}
              className="flex justify-between items-center p-3 border rounded"
            >
              <span>{room.name}</span>
              <div className="flex gap-2">
                <Button variant="outline">Sửa</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteRoom(room._id)}
                >
                  Xóa
                </Button>
                <Button
                  onClick={() =>
                    router.push(
                      `/admin/cinemas/${cinemaId}/rooms/${room._id}/seats`
                    )
                  }
                >
                  Quản lý ghế
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
