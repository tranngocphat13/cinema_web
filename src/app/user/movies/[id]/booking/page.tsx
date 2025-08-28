"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";

type Params = { id: string };

interface Showtime {
  id: string;
  date: string;
  times: string[];
}

export default function BookingPage() {
  const { id } = useParams<Params>();
  const router = useRouter();

  // Fake data (có thể gọi API backend sau)
  const movie = {
    id,
    title: "Inception",
    posterUrl: "/poster.jpg",
    description: "Một bộ phim khoa học viễn tưởng đình đám.",
  };

  const showtimes: Showtime[] = [
    { id: "1", date: "2025-08-29", times: ["10:00", "14:00", "19:00"] },
    { id: "2", date: "2025-08-30", times: ["11:00", "15:00", "20:30"] },
  ];

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleNext = () => {
    if (!selectedDate || !selectedTime) {
      alert("Vui lòng chọn ngày và giờ chiếu!");
      return;
    }
    router.push(`/user/movies/${id}/seat?date=${selectedDate}&time=${selectedTime}`);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* Left - chọn suất chiếu */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-4">Đặt vé - {movie.title}</h1>

        <div className="space-y-6">
          {showtimes.map((show) => (
            <div key={show.id}>
              <h2 className="text-lg font-semibold">{show.date}</h2>
              <div className="flex flex-wrap gap-3 mt-2">
                {show.times.map((time) => (
                  <button
                    key={time}
                    onClick={() => {
                      setSelectedDate(show.date);
                      setSelectedTime(time);
                    }}
                    className={`px-4 py-2 rounded-lg border ${
                      selectedDate === show.date && selectedTime === time
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleNext}
          className="mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          Tiếp tục chọn ghế
        </button>
      </div>

      {/* Right - poster phim */}
      <div className="w-full md:w-1/3">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          width={400}
          height={600}
          className="rounded-lg shadow-lg"
        />
        <p className="mt-4 text-gray-600">{movie.description}</p>
      </div>
    </div>
  );
}
