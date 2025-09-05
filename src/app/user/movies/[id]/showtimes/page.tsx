"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function MovieShowtimesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);

  useEffect(() => {
    fetch("/api/showtimes")
      .then((res) => res.json())
      .then((data: Showtime[]) => {
        const filtered = data.filter((s) => s.movie._id === id);
        setShowtimes(filtered);
      });
  }, [id]);

  const handleSelectShowtime = (showtimeId: string) => {
    router.push(`/user/showtimes/${showtimeId}/seats`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Chọn suất chiếu</h1>
      <ul>
        {showtimes.map((s) => (
          <li key={s._id} className="mb-2">
            <button
              onClick={() => handleSelectShowtime(s._id)}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              {new Date(s.startTime).toLocaleString()} - Phòng {s.room}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
