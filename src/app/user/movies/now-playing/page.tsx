"use client";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";

interface Movie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
}

const fetcher = (url: string): Promise<Movie[]> =>
  fetch(url).then((res) => res.json());

export default function NowPlayingPage() {
  const { data, error } = useSWR<Movie[]>("/api/movies/now-playing", fetcher);

  if (error) return <p>Lỗi khi tải dữ liệu: {(error as Error).message}</p>;
  if (!data) return <p>Đang tải...</p>;

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      {data.map((movie) => (
        <div
          key={movie.id}
          className="border rounded-lg shadow hover:shadow-lg p-2"
        >
          <div className="relative w-full h-[400px]">
            <Image
              src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
              alt={movie.title}
              fill
              className="object-cover rounded-lg"
            />
          </div>
          <h3 className="text-lg font-semibold mt-2">{movie.title}</h3>
          <p className="text-sm">{movie.release_date}</p>
          <Link
            href={`/user/movies/${movie.id}`}
            className="block mt-2 bg-blue-500 text-white text-center py-1 rounded hover:bg-blue-600"
          >
            Xem Chi Tiết
          </Link>
        </div>
      ))}
    </div>
  );
}
