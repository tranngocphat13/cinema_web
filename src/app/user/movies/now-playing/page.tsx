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
    <div className="min-h-screen text-white px-8 py-12">
      <h1 className="text-center text-4xl font-bold mb-10">Now Showing</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {data.map((movie) => (
          <div
            key={movie.tmdbId}
            className="flex flex-col justify-between items-center rounded-2xl p-4 transition"
            style={{ height: "650px", width: "300px" }}
          >
            {/* Nội dung trên (Poster + Tên) */}
            <div className="flex flex-col items-center">
              <div className="relative w-[300px] h-[450px] rounded-xl overflow-hidden group">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="mt-4 font-semibold text-xl text-center leading-snug w-[300px]">
                {movie.title}
              </h3>
            </div>

            {/* Nút cố định dưới cùng */}
            <div className="flex gap-4">
              <Link
                href={`/user/movies/${movie.tmdbId}`}
                className="bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Chi tiết
              </Link>
              <Link
                href={`/user/movies/${movie.tmdbId}`}
                className="bg-yellow-500 px-5 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Đặt vé
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
