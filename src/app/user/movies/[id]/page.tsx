"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  _id?: string; // nếu API của bạn có _id thì sẽ dùng nó để query showtimes
  tmdbId: number;
  title: string;
  posterUrl?: string;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

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

  // Helper: chuẩn hoá payload showtimes về mảng
  function normalizeShowtimesPayload(payload: unknown): Showtime[] {
    if (Array.isArray(payload)) return payload as Showtime[];
    if (payload && typeof payload === "object") {
      const p = payload as Record<string, unknown>;
      if (Array.isArray(p.showtimes)) return p.showtimes as Showtime[];
      if (Array.isArray(p.data)) return p.data as Showtime[];
    }
    return [];
  }

  // Load movie
  useEffect(() => {
    fetch(`/api/movies/${id}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch((e) => {
        console.error("GET /api/movies/:id error:", e);
        setMovie(null);
      });
  }, [id]);

  // Load cinemas
  useEffect(() => {
    fetch(`/api/cinemas`)
      .then((res) => res.json())
      .then(setCinemas)
      .catch((e) => console.error("GET /api/cinemas error:", e));
  }, []);

  // Load showtimes khi chọn cinema
  useEffect(() => {
    const run = async () => {
      if (!selectedCinemaId || !movie) return;

      // Ưu tiên dùng movie._id nếu có; nếu không có, fallback dùng tmdbId (đồng bộ với API của bạn)
      const queryParam = movie._id
        ? `movieId=${encodeURIComponent(movie._id)}`
        : `tmdbId=${encodeURIComponent(String(movie.tmdbId))}`;

      const url = `/api/showtimes?${queryParam}&cinemaId=${encodeURIComponent(
        selectedCinemaId
      )}`;
      const res = await fetch(url);

      if (!res.ok) {
        const txt = await res.text();
        console.error("GET /api/showtimes failed:", res.status, txt);
        setShowtimes([]);
        setDates([]);
        return;
      }

      const payload = await res.json();
      // Bạn có thể mở log này khi cần xem server trả gì:
      // console.log("Showtimes payload:", payload);

      const arr = normalizeShowtimesPayload(payload);
      setShowtimes(arr);

      const uniqueDates = Array.from(
        new Set(arr.map((st) => new Date(st.startTime).toDateString()))
      );
      setDates(uniqueDates);
    };

    run().catch((e) => {
      console.error("Load showtimes error:", e);
      setShowtimes([]);
      setDates([]);
    });
  }, [selectedCinemaId, movie]);

  // Tải ghế THEO SUẤT CHIẾU
  const fetchSeatsByShowtime = async (showtimeId: string) => {
    try {
      const res = await fetch(`/api/showtimes/${showtimeId}/seats`);
      if (!res.ok) {
        console.error("GET /api/showtimes/:id/seats failed:", res.status);
        setSeats([]);
        return;
      }
      const data: unknown = await res.json();
      const arr = Array.isArray(data) ? (data as Seat[]) : [];
      setSeats(arr);
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

  // Giữ ghế 5 phút (tuỳ chọn trước khi thanh toán)
  const handleHoldSeats = async () => {
    if (!selectedShowtimeId || selectedSeats.length === 0) return;
    const res = await fetch("/api/hold-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showtimeId: selectedShowtimeId,
        seatIds: selectedSeats,
      }),
    });
    const data = await res.json();
    if (data?.ok) {
      alert("Đã giữ ghế 5 phút. Hãy thanh toán trong thời gian này.");
    } else {
      alert(data?.error || "Không thể giữ ghế");
      // reload lại để phản ánh trạng thái mới nhất
      fetchSeatsByShowtime(selectedShowtimeId);
    }
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
                    setSelectedSeats([]);
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
                      setSelectedSeats([]);
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
                    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

                    const isOngoing = now >= start && now < end;
                    const isPast = now >= end;

                    return (
                      <button
                        key={st._id}
                        disabled={isOngoing || isPast}
                        onClick={() => {
                          if (!isOngoing && !isPast) {
                            setSelectedShowtimeId(st._id);
                            setSelectedSeats([]);
                            // dùng endpoint seats theo SHOWTIME
                            fetchSeatsByShowtime(st._id);
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
                    const row = seat.number.charAt(0);
                    if (!acc[row]) acc[row] = [];
                    acc[row].push(seat);
                    return acc;
                  },
                  {} as Record<string, Seat[]>
                );

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
                        <span className="w-6 font-bold text-gray-300">
                          {row}
                        </span>
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

              {/* Thanh hành động */}
              {selectedSeats.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-3 justify-between items-center p-4 bg-gray-900 rounded-xl">
                  <p className="text-lg font-bold">
                    Tổng tiền: {totalPrice.toLocaleString()}đ
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleHoldSeats}
                      className="bg-blue-500 px-5 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                    >
                      Giữ ghế 5 phút
                    </button>

                    <button
                      onClick={() => {
                        if (!movie || !selectedShowtimeId || !selectedDate)
                          return;

                        const selectedShowtime = showtimes.find(
                          (st) => st._id === selectedShowtimeId
                        );
                        const time = selectedShowtime
                          ? new Date(
                              selectedShowtime.startTime
                            ).toLocaleTimeString("vi-VN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "";

                        const seatNumbers = selectedSeats
                          .map((id) => seats.find((s) => s._id === id)?.number)
                          .filter(Boolean)
                          .join(",");

                        // thêm seatIds để trang thanh toán gọi API
                        const seatIdsParam = selectedSeats.join(",");

                        router.push(
                          `/user/booking/detail?movieTitle=${encodeURIComponent(
                            movie.title
                          )}&movieId=${encodeURIComponent(
                            String(id)
                          )}&date=${encodeURIComponent(
                            selectedDate
                          )}&time=${encodeURIComponent(
                            time
                          )}&seats=${encodeURIComponent(
                            seatNumbers
                          )}&seatIds=${encodeURIComponent(
                            seatIdsParam
                          )}&total=${totalPrice}&showtimeId=${selectedShowtimeId}`
                        );
                      }}
                      className="bg-green-500 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                    >
                      Xác nhận
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Poster phim */}
        <div className="space-y-6">
          <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
            {movie?.posterUrl && (
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <h2 className="text-2xl font-bold">{movie?.title}</h2>
        </div>
      </div>
    </div>
  );
}
