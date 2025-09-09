"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Cinema {
  _id: string;
  name: string;
  address: string;
}

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  overview: string;
  genres: string[];
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  releaseDate?: string;
  runtime?: number;
  ratingLabel?: string;
  countries: string[];
  error?: string;
}

interface Showtime {
  _id: string;
  movie: string;
  startTime: string;
  endTime?: string;
  room: { _id: string; name?: string };
  cinema: { _id: string; name?: string };
}

interface Seat {
  _id: string;
  number: string;
  type: "normal" | "vip" | "couple";
  isAvailable: boolean;
  row: string;
  column: number;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();

  // movie
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // cinema
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);

  // showtime
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(
    null
  );

  // seats
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // ticket
  const ticketTypes = [
    { type: "normal", label: "Thường", price: 80000 },
    { type: "vip", label: "VIP", price: 120000 },
    { type: "couple", label: "Đôi", price: 150000 },
  ];
  const [selectedTicket, setSelectedTicket] = useState<
    "normal" | "vip" | "couple"
  >("normal");

  // step
  const [step, setStep] = useState(1);

  // load movie
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/movies/${id}`);
        if (!res.ok) throw new Error("Không thể tải phim");
        const data: Movie = await res.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // load cinemas
  const fetchCinemas = async () => {
    try {
      const res = await fetch(`/api/cinemas`);
      if (!res.ok) throw new Error("Không thể tải chi nhánh");
      const data: Cinema[] = await res.json();
      setCinemas(data);
    } catch (err) {
      console.error(err);
      setCinemas([]);
    }
  };

  // load showtimes (filter theo cinema + movie)
  const fetchShowtimes = async (cinemaId: string, tmdbId: number) => {
    try {
      const res = await fetch(
        `/api/showtimes?movieId=${tmdbId}&cinemaId=${cinemaId}`
      );
      if (!res.ok) throw new Error("Không thể tải lịch chiếu");
      const data: Showtime[] = await res.json();
      setShowtimes(data);
    } catch (err) {
      console.error(err);
      setShowtimes([]);
    }
  };

  // load seats
  const fetchSeats = async (cinemaId: string, roomId: string) => {
    try {
      const res = await fetch(`/api/cinemas/${cinemaId}/rooms/${roomId}/seats`);
      if (!res.ok) throw new Error("Không thể tải ghế");
      const data: Seat[] = await res.json();
      setSeats(data);
    } catch (err) {
      console.error(err);
      setSeats([]);
    }
  };

  // chọn ghế
  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
  };

  // thanh toán
  const handlePayment = () => {
    console.log({
      movieId: movie?._id,
      cinemaId: selectedCinemaId,
      showtimeId: selectedShowtimeId,
      seats: selectedSeats,
      ticketType: selectedTicket,
    });
    setStep(6);
  };

  if (loading)
    return <p className="text-center text-white mt-10">Đang tải...</p>;
  if (!movie || movie.error)
    return (
      <p className="text-center text-red-500 mt-10">Không tìm thấy phim</p>
    );

  const ticketPrice =
    ticketTypes.find((t) => t.type === selectedTicket)?.price || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Banner */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        {(movie.backdropUrl || movie.posterUrl) && (
          <Image
            src={movie.backdropUrl ? movie.backdropUrl : movie.posterUrl!}
            alt={movie.title}
            fill
            className="object-cover brightness-50"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-10 left-5 md:left-20 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">{movie.title}</h1>
          <p className="text-gray-300">{movie.ratingLabel}</p>
        </div>
      </div>

      {/* Flow */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 1 */}
        {step === 1 && (
          <button
            onClick={() => {
              fetchCinemas();
              setStep(2);
            }}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold"
          >
            Chọn chi nhánh
          </button>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 className="text-xl font-bold mb-3">Chọn chi nhánh</h3>
            {cinemas.map((c) => (
              <button
                key={c._id}
                onClick={() => {
                  setSelectedCinemaId(c._id);
                  if (movie) fetchShowtimes(c._id, movie.tmdbId);
                  setStep(3);
                }}
                className="block w-full text-left px-4 py-2 mb-2 rounded-lg border bg-gray-800 hover:bg-gray-700"
              >
                {c.name} - {c.address}
              </button>
            ))}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 className="text-xl font-bold mb-3">Chọn suất chiếu</h3>
            {showtimes.length === 0 && (
              <p className="text-gray-400">Chưa có suất chiếu cho phim này</p>
            )}
            {showtimes.map((st) => (
              <button
                key={st._id}
                onClick={() => {
                  setSelectedShowtimeId(st._id);
                  fetchSeats(st.cinema._id, st.room._id);
                  setStep(4);
                }}
                className="block w-full text-left px-4 py-2 mb-2 rounded-lg border bg-gray-800 hover:bg-gray-700"
              >
                {new Date(st.startTime).toLocaleString("vi-VN")} - Phòng{" "}
                {st.room.name || st.room._id}
              </button>
            ))}
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h3 className="text-xl font-bold mb-3">Chọn ghế</h3>
            <div className="grid grid-cols-8 gap-2 max-w-xl">
              {seats.map((seat) => (
                <button
                  key={seat._id}
                  disabled={!seat.isAvailable}
                  onClick={() => toggleSeat(seat._id)}
                  className={`px-3 py-2 rounded ${
                    !seat.isAvailable
                      ? "bg-gray-600"
                      : selectedSeats.includes(seat._id)
                      ? "bg-green-500"
                      : seat.type === "vip"
                      ? "bg-yellow-500"
                      : seat.type === "couple"
                      ? "bg-pink-500"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  {seat.number}
                </button>
              ))}
            </div>
            {selectedSeats.length > 0 && (
              <button
                onClick={() => setStep(5)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
              >
                Tiếp tục
              </button>
            )}
          </div>
        )}

        {/* Step 5 */}
        {step === 5 && (
          <div>
            <h3 className="text-xl font-bold mb-3">Loại vé</h3>
            {ticketTypes.map((t) => (
              <button
                key={t.type}
                onClick={() =>
                  setSelectedTicket(t.type as "normal" | "vip" | "couple")
                }
                className={`px-4 py-2 mr-2 rounded-lg border ${
                  selectedTicket === t.type
                    ? "bg-green-700 border-green-500"
                    : "bg-gray-800"
                }`}
              >
                {t.label} - {t.price.toLocaleString()}đ
              </button>
            ))}
            <p className="mt-4 font-bold">
              Tổng tiền: {(ticketPrice * selectedSeats.length).toLocaleString()}đ
            </p>
            <button
              onClick={handlePayment}
              className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl font-semibold"
            >
              Thanh toán
            </button>
          </div>
        )}

        {/* Step 6 */}
        {step === 6 && (
          <div className="text-center mt-10">
            <h3 className="text-2xl font-bold text-green-400">
              🎉 Đặt vé thành công!
            </h3>
            <p className="mt-2">
              Cảm ơn bạn đã đặt vé. Hãy kiểm tra email để nhận thông tin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
