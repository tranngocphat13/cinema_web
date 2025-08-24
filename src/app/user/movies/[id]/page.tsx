"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Trailer {
  key: string;
}

interface MovieDetail {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string;
  trailer?: Trailer;
}

const fetcher = (url: string): Promise<MovieDetail> =>
  fetch(url).then((res) => res.json());

export default function MovieDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, error } = useSWR<MovieDetail>(`/api/movies/${id}`, fetcher);

  if (error) return <p>Lỗi khi tải dữ liệu: {(error as Error).message}</p>;
  if (!data) return <p>Đang tải...</p>;

  const posterUrl = data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : "/no-poster.jpg";

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{data.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative w-full h-[450px]">
          <Image
            src={posterUrl}
            alt={data.title}
            fill
            className="object-cover rounded-lg shadow"
            priority
          />
        </div>

        <div className="md:col-span-2">
          <p className="mb-2">{data.overview || "Chưa có mô tả"}</p>
          <p>
            <strong>Ngày phát hành:</strong> {data.release_date}
          </p>
          <p>
            <strong>Đánh giá:</strong> {data.vote_average} / 10 (
            {data.vote_count} đánh giá)
          </p>

          {data.trailer && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Trailer</h2>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${data.trailer.key}`}
                title="Trailer"
                allowFullScreen
                className="rounded-lg shadow"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
