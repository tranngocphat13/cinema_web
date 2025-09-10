"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Cinema {
  _id: string;
  name: string;
}

interface Showtime {
  _id: string;
  cinema: { _id: string; name?: string };
  room: { _id: string; name?: string };
  startTime: string;
}

interface Seat {
  _id: string;
  number: string;
  type: "normal" | "vip" | "couple";
  isAvailable: boolean;
}

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  posterUrl?: string;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(
    null
  );
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Giá vé
  const ticketPrices: Record<"normal" | "vip" | "couple", number> = {
    normal: 80000,
    vip: 120000,
    couple: 150000,
  };

  // Tổng tiền
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s._id === seatId);
    return seat ? sum + ticketPrices[seat.type] : sum;
  }, 0);

  // Load movie
  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch(console.error);
  }, [id]);

  // Load cinemas
  useEffect(() => {
    fetch(`/api/cinemas`)
      .then((res) => res.json())
      .then(setCinemas)
      .catch(console.error);
  }, []);

  // Load showtimes khi chọn cinema
  useEffect(() => {
    if (selectedCinemaId && movie) {
      fetch(
        `/api/showtimes?movieId=${movie.tmdbId}&cinemaId=${selectedCinemaId}`
      )
        .then((res) => res.json())
        .then((data: Showtime[]) => {
          setShowtimes(data);
          // Lấy danh sách ngày từ showtimes
          const uniqueDates = Array.from(
            new Set(data.map((st) => new Date(st.startTime).toDateString()))
          );
          setDates(uniqueDates);
        })
        .catch(console.error);
    }
  }, [selectedCinemaId, movie]);

  // Load seats khi chọn suất chiếu
  const fetchSeats = async (cinemaId: string, roomId: string) => {
    try {
      const res = await fetch(`/api/cinemas/${cinemaId}/rooms/${roomId}/seats`);
      const data: Seat[] = await res.json();
      setSeats(data);
    } catch (err) {
      console.error(err);
      setSeats([]);
    }
  };

  // Toggle chọn ghế
  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  if (!movie)
    return <p className="text-center text-white mt-10">Đang tải...</p>;

  return (
    <div className="min-h-screen text-white px-6 py-10 bg-gradient-to-b from-black via-green-900/70 to-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: chọn rạp, ngày, suất */}
        <div className="lg:col-span-2 space-y-12">
          {/* Chọn rạp */}
          <div>
            <h3 className="text-xl font-bold mb-4">Theater</h3>
            <div className="flex flex-wrap gap-4">
              {cinemas.map((c) => (
                <button
                  key={c._id}
                  onClick={() => {
                    setSelectedCinemaId(c._id);
                    setSelectedDate(null);
                    setSelectedShowtimeId(null);
                    setSeats([]);
                  }}
                  className={`px-6 py-3 rounded-full border-2 flex items-center gap-2 transition ${
                    selectedCinemaId === c._id
                      ? "bg-green-500 border-green-500 text-black"
                      : "border-white hover:bg-green-600 hover:text-black"
                  }`}
                >
                  <span>📍</span> {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chọn ngày */}
          {dates.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">Date</h3>
              <div className="flex gap-4 flex-wrap">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedShowtimeId(null);
                      setSeats([]);
                    }}
                    className={`w-[90px] py-3 rounded-lg border-2 transition ${
                      selectedDate === date
                        ? "bg-green-500 border-green-500 text-black"
                        : "border-white hover:bg-green-600 hover:text-black"
                    }`}
                  >
                    <p className="text-sm">
                      {date.split(" ")[1]} {date.split(" ")[2]}
                    </p>
                    <p className="font-bold">{date.split(" ")[0]}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chọn giờ */}
          {selectedDate && (
            <div>
              <h3 className="text-xl font-bold mb-4">Time</h3>
              <div className="flex gap-4 flex-wrap">
                {showtimes
                  .filter(
                    (st) =>
                      new Date(st.startTime).toDateString() === selectedDate
                  )
                  .map((st) => {
                    const now = new Date();
                    const start = new Date(st.startTime);
                    const end = new Date(
                      start.getTime() + 2 * 60 * 60 * 1000
                    ); // giả sử phim dài 2h

                    const isOngoing = now >= start && now < end;
                    const isPast = now >= end;

                    return (
                      <button
                        key={st._id}
                        disabled={isOngoing || isPast}
                        onClick={() => {
                          if (!isOngoing && !isPast) {
                            setSelectedShowtimeId(st._id);
                            fetchSeats(st.cinema._id, st.room._id);
                          }
                        }}
                        className={`px-5 py-3 rounded-lg border-2 transition ${
                          isOngoing
                            ? "bg-gray-500 border-gray-500 text-white cursor-not-allowed"
                            : isPast
                            ? "bg-gray-700 border-gray-700 text-white cursor-not-allowed"
                            : selectedShowtimeId === st._id
                            ? "bg-green-500 border-green-500 text-black"
                            : "border-white hover:bg-green-600 hover:text-black"
                        }`}
                      >
                        {new Date(st.startTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </button>
                    );
                  })}
              </div>
              {/* Legend */}
              <div className="mt-4 flex gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-green-500 rounded"></span> Có thể
                  đặt
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-500 rounded"></span> Đang chiếu
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 bg-gray-700 rounded"></span> Đã chiếu
                </div>
              </div>
            </div>
          )}

          {/* Chọn ghế */}
          {selectedShowtimeId && (
            <div>
              <h3 className="text-xl font-bold mb-4">Seats</h3>
              {/* Gom ghế theo hàng */}
              {(() => {
                const groupedSeats: Record<string, Seat[]> = seats.reduce(
                  (acc, seat) => {
                    const row = seat.number.charAt(0); // Ví dụ: A1 -> "A"
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(seat);
                    return acc;
                  },
                  {} as Record<string, Seat[]>
                );

                // Sắp xếp ghế trong từng hàng theo số
                Object.keys(groupedSeats).forEach((row) => {
                  groupedSeats[row].sort((a, b) => {
                    const numA = parseInt(a.number.slice(1));
                    const numB = parseInt(b.number.slice(1));
                    return numA - numB;
                  });
                });

                return (
                  <div className="space-y-3">
                    {Object.entries(groupedSeats).map(([row, rowSeats]) => (
                      <div
                        key={row}
                        className="flex gap-2 items-center justify-center"
                      >
                        {/* Label hàng */}
                        <span className="w-6 font-bold text-gray-300">
                          {row}
                        </span>

                        {/* Các ghế trong hàng */}
                        <div className="flex gap-2">
                          {rowSeats.map((seat) => (
                            <button
                              key={seat._id}
                              disabled={!seat.isAvailable}
                              onClick={() => toggleSeat(seat._id)}
                              className={`w-12 h-12 rounded-md font-semibold transition
                  ${
                    !seat.isAvailable
                      ? "bg-gray-600 cursor-not-allowed"
                      : selectedSeats.includes(seat._id)
                      ? "bg-green-500 text-white"
                      : seat.type === "vip"
                      ? "bg-yellow-400 text-black"
                      : seat.type === "couple"
                      ? "bg-pink-500 text-white"
                      : "bg-white text-black"
                  }`}
                            >
                              {seat.number}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              {selectedSeats.length > 0 && (
                <div className="mt-6 flex justify-between items-center p-4 bg-gray-900 rounded-xl">
                  <p className="text-lg font-bold">
                    Tổng tiền: {totalPrice.toLocaleString()}đ
                  </p>
                  <button className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition">
                    Xác nhận
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Poster phim */}
        <div className="space-y-6">
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
            {movie.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <h2 className="text-2xl font-bold">{movie.title}</h2>
        </div>
      </div>
    </div>
  );
}
