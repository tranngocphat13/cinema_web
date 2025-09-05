"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

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
  movie: Movie;
  startTime: string;
  room: string; // trong DB của bạn đang để string
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
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  // showtimes
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [showShowtimes, setShowShowtimes] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );

  // seats
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // vé
  const ticketTypes = [
    { type: "normal", label: "Thường", price: 80000 },
    { type: "vip", label: "VIP", price: 120000 },
    { type: "couple", label: "Đôi", price: 150000 },
  ];
  const [selectedTicket, setSelectedTicket] = useState<
    "normal" | "vip" | "couple"
  >("normal");

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

const fetchShowtimes = async () => {
  try {
    const res = await fetch(`/api/showtimes?movie=${id}`);
    if (!res.ok) throw new Error("Không thể tải lịch chiếu");
    const data: Showtime[] = await res.json();
    setShowtimes(data);
    setShowShowtimes(true);
  } catch (err) {
    console.error(err);
    setShowtimes([]);
    setShowShowtimes(true);
  }
};

  // fetch seats
  const fetchSeats = async (roomId: string) => {
    try {
      // ở model showtime bạn đang để room là string, mình giả sử là roomId
      const res = await fetch(`/api/cinemas/1/rooms/${roomId}/seats`);
      const data = await res.json();
      setSeats(data);
    } catch (err) {
      console.error(err);
      setSeats([]);
    }
  };

  const toggleSeat = (seatId: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((s) => s !== seatId)
        : [...prev, seatId]
    );
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

      {/* Nội dung chi tiết */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Thông tin phim</h2>
        <p className="mb-4 text-gray-300">{movie.overview}</p>

        {/* Nút hành động */}
        <div className="flex gap-4">
          {movie.trailerUrl && (
            <a
              href={movie.trailerUrl}
              target="_blank"
              className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              Xem Trailer
            </a>
          )}
          <button
            onClick={fetchShowtimes}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            Đặt Vé
          </button>
        </div>

        {/* Lịch chiếu */}
        {showShowtimes && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-3">Lịch chiếu</h3>

            {showtimes.length === 0 ? (
              <p className="text-gray-400">Hiện chưa có suất chiếu</p>
            ) : (
              <div className="space-y-3">
                {showtimes.map((st) => (
                  <button
                    key={st._id}
                    onClick={() => {
                      setSelectedShowtime(st);
                      fetchSeats(st.room);
                    }}
                    className={`block w-full text-left px-4 py-2 rounded-lg border ${
                      selectedShowtime?._id === st._id
                        ? "bg-green-700 border-green-500"
                        : "bg-gray-800 border-gray-600"
                    }`}
                  >
                    {new Date(st.startTime).toLocaleString("vi-VN")} - Phòng{" "}
                    {st.room}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Ghế */}
        {selectedShowtime && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-3">Chọn ghế</h3>
            {seats.length === 0 ? (
              <p className="text-gray-400">Đang tải ghế...</p>
            ) : (
              <div className="grid grid-cols-8 gap-2 max-w-xl">
                {seats.map((seat) => (
                  <button
                    key={seat._id}
                    disabled={!seat.isAvailable}
                    onClick={() => toggleSeat(seat._id)}
                    className={`px-3 py-2 rounded ${
                      !seat.isAvailable
                        ? "bg-gray-600 cursor-not-allowed"
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
            )}
          </div>
        )}

        {/* Chọn loại vé + thanh toán */}
        {selectedSeats.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-3">Loại vé</h3>
            <div className="flex gap-4">
              {ticketTypes.map((t) => (
                <button
                  key={t.type}
                  onClick={() =>
                    setSelectedTicket(t.type as "normal" | "vip" | "couple")
                  }
                  className={`px-4 py-2 rounded-lg border ${
                    selectedTicket === t.type
                      ? "bg-green-700 border-green-500"
                      : "bg-gray-800 border-gray-600"
                  }`}
                >
                  {t.label} - {t.price.toLocaleString()}đ
                </button>
              ))}
            </div>

            <p className="mt-4 font-bold">
              Tổng tiền: {(ticketPrice * selectedSeats.length).toLocaleString()}
              đ
            </p>

            <button className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition">
              Thanh toán
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
