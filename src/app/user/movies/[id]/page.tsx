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

  if (loading) return <p>Đang tải...</p>;
  if (!movie || movie.error) return <p>Không tìm thấy phim</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-600 mb-4">{movie.ratingLabel}</p>

      {movie.backdropUrl && (
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          width={1280}
          height={720}
          className="w-full rounded-lg shadow mb-4"
          priority
        />
      )}

      <p className="mb-4">{movie.overview}</p>
      <p>
        <b>Thể loại:</b> {movie.genres.join(", ")}
      </p>
      <p>
        <b>Quốc gia:</b> {movie.countries.join(", ")}
      </p>
      <p>
        <b>Ngày phát hành:</b>{" "}
        {movie.releaseDate
          ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
          : "Chưa có"}
      </p>
      <p>
        <b>Thời lượng:</b> {movie.runtime ? `${movie.runtime} phút` : "Chưa có"}
      </p>

      {movie.trailerUrl && (
        <div className="mt-4">
          <iframe
            width="100%"
            height="315"
            src={movie.trailerUrl.replace("watch?v=", "embed/")}
            title="Trailer"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      )}
    </div>
  );
}
