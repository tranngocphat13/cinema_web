"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Showtime {
  _id: string;
  startTime: string;
  room?: { name: string };
}

export default function ShowtimesPage({ params }: { params: { id: string } }) {
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/showtimes?movieId=${params.id}`)
      .then(res => res.json())
      .then((data: Showtime[]) => setShowtimes(data));
  }, [params.id]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Chọn Suất Chiếu</h2>
      {showtimes.map(st => (
        <div
          key={st._id}
          className="p-4 mb-2 border rounded cursor-pointer hover:bg-gray-100"
          onClick={() => router.push(`/user/booking/${st._id}`)}
        >
          <span>{new Date(st.startTime).toLocaleString("vi-VN")}</span>
          {st.room && <span className="ml-4 text-gray-500">{st.room.name}</span>}
        </div>
      ))}
    </div>
  );
}
