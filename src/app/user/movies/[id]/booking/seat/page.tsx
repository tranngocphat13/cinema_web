"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Params = { id: string };

interface Seat {
  id: string;
  row: string;
  number: number;
  isBooked: boolean;
}

export default function SeatSelectionPage() {
  const { id } = useParams<Params>();
  const router = useRouter();
  const searchParams = useSearchParams();

  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";

  // Fake seat data (backend sẽ trả thật)
  const seats: Seat[] = Array.from({ length: 30 }, (_, i) => ({
    id: `S${i + 1}`,
    row: String.fromCharCode(65 + Math.floor(i / 10)), // A, B, C
    number: (i % 10) + 1,
    isBooked: i % 7 === 0, // vài ghế đã đặt
  }));

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [countdown, setCountdown] = useState<number>(180); // 3 phút = 180s

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSeat = (seat: Seat) => {
    if (seat.isBooked) return;
    if (selectedSeats.find((s) => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const handleNext = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ghế!");
      return;
    }
    router.push(
      `/user/movies/${id}/payment?date=${date}&time=${time}&seats=${selectedSeats
        .map((s) => s.id)
        .join(",")}`
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Chọn ghế</h1>
      <p className="mb-4 text-gray-600">
        Phim ID: {id} | Ngày: {date} | Suất: {time}
      </p>

      {/* Countdown */}
      <div className="mb-4 text-red-600 font-semibold">
        Ghế sẽ được giữ trong: {Math.floor(countdown / 60)}:
        {(countdown % 60).toString().padStart(2, "0")}
      </div>

      {/* Ghế */}
      <div className="grid grid-cols-10 gap-2 max-w-3xl">
        {seats.map((seat) => {
          const isSelected = selectedSeats.some((s) => s.id === seat.id);
          return (
            <button
              key={seat.id}
              disabled={seat.isBooked}
              onClick={() => toggleSeat(seat)}
              className={`p-2 text-sm rounded-md border ${
                seat.isBooked
                  ? "bg-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "bg-green-500 text-white"
                  : "bg-white hover:bg-gray-200"
              }`}
            >
              {seat.row}{seat.number}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
        >
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  );
}
