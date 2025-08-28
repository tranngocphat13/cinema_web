"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  status?: string;
  runtime?: number;
  ratingLabel?: string;
  countries: string[];
  error?: string;
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading)
    return <p className="text-center text-white mt-10">Đang tải...</p>;
  if (!movie || movie.error)
    return <p className="text-center text-red-500 mt-10">Không tìm thấy phim</p>;

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
      <div className="max-w-5xl mx-auto px-4 py-8 md:flex md:gap-8">
        {/* Poster */}
        {movie.posterUrl && (
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={400}
              height={600}
              className="rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Thông tin */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">Thông tin phim</h2>
          <p className="mb-4 text-gray-300">{movie.overview}</p>

          <ul className="space-y-2 mb-6">
            <li>
              <b>Thể loại:</b> {movie.genres.join(", ")}
            </li>
            <li>
              <b>Quốc gia:</b> {movie.countries.join(", ")}
            </li>
            <li>
              <b>Ngày phát hành:</b>{" "}
              {movie.releaseDate
                ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
                : "Chưa có"}
            </li>
            <li>
              <b>Thời lượng:</b>{" "}
              {movie.runtime ? `${movie.runtime} phút` : "Chưa có"}
            </li>
          </ul>

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
            <Link
              href={`/booking/${movie._id}`}
              className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-xl font-semibold transition"
            >
              Đặt Vé
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
