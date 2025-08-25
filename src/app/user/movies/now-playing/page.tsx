"use client";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  releaseDate: string;
  posterUrl: string;
}

const fetcher = (url: string): Promise<Movie[]> =>
  fetch(url).then((res) => res.json());

export default function NowPlayingPage() {
  const { data, error } = useSWR<Movie[]>("/api/movies/now-playing", fetcher);

  if (error) return <p className="text-center text-red-500">Lỗi tải dữ liệu!</p>;
  if (!data) return <p className="text-center">Đang tải...</p>;

  return (
    <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {data.map((movie) => (
        <div
          key={movie.tmdbId}
          className="relative rounded-xl overflow-hidden shadow-lg group cursor-pointer"
        >
          {/* Poster full */}
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
            <h3 className="text-white font-bold text-sm truncate">
              {movie.title}
            </h3>
            <p className="text-gray-300 text-xs mb-2">
              {new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
            </p>
            <Link
              href={`/user/movies/${movie.tmdbId}`}
              className="bg-blue-600 text-white text-xs py-1 px-3 rounded hover:bg-blue-700 transition self-start"
            >
              Xem Chi Tiết
            </Link>
            <Link
              href={`/user/movies/booking/${movie.tmdbId}`}
              className="bg-yellow-500 text-white text-xs py-1 px-3 rounded hover:bg-yellow-600 transition self-start"
            >
              Đặt Vé
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
