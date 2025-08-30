"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Cinema {
  _id: string;
  name: string;
  address: string;
}

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [newCinema, setNewCinema] = useState({ name: "", address: "" });

  // Lấy danh sách rạp
  const fetchCinemas = async () => {
    const res = await fetch("/api/cinemas");
    const data = await res.json();
    setCinemas(data);
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // Thêm Cinema
  const handleAddCinema = async () => {
    const res = await fetch("/api/cinemas", {
      method: "POST",
      body: JSON.stringify(newCinema),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      setNewCinema({ name: "", address: "" });
      fetchCinemas();
    }
  };

  // Xóa Cinema
  const handleDeleteCinema = async (id: string) => {
    await fetch(`/api/cinemas/${id}`, { method: "DELETE" });
    fetchCinemas();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý rạp chi nhánh</h1>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Tên rạp"
          value={newCinema.name}
          onChange={(e) => setNewCinema({ ...newCinema, name: e.target.value })}
        />
        <Input
          placeholder="Địa chỉ"
          value={newCinema.address}
          onChange={(e) =>
            setNewCinema({ ...newCinema, address: e.target.value })
          }
        />
        <Button onClick={handleAddCinema}>+ Thêm</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cinemas.map((cinema) => (
          <Card key={cinema._id} className="rounded-2xl shadow p-4">
            <CardContent>
              <h2 className="text-xl font-semibold">{cinema.name}</h2>
              <p className="text-gray-600">{cinema.address}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline">Sửa</Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteCinema(cinema._id)}
                >
                  Xóa
                </Button>
                <Button
                  onClick={() =>
                    (window.location.href = `/admin/cinemas/${cinema._id}/rooms`)
                  }
                >
                  Quản lý phòng
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
