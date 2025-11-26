"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Ticket, Info } from "lucide-react";

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  releaseDate: string;
  posterUrl: string;
}

const fetcher = (url: string): Promise<Movie[]> => fetch(url).then((res) => res.json());

function yearFrom(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function NowPlayingPage() {
  const { data, error, isLoading } = useSWR<Movie[]>("/api/movies/now-playing", fetcher);

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <p className="text-[11px] tracking-[0.26em] uppercase text-emerald-200/70">
            MyCinema • Now Playing
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold">Now Showing</h1>
          <p className="max-w-2xl text-white/60 text-sm sm:text-base">
            Chọn phim bạn thích và đặt vé nhanh chóng.
          </p>
        </div>

        {/* States */}
        {error && <p className="text-center text-red-300">Lỗi tải dữ liệu!</p>}
        {isLoading && !data && <p className="text-center text-white/70">Đang tải...</p>}

        {/* Grid */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {data.map((movie) => {
              const year = yearFrom(movie.releaseDate);

              return (
                <div
                  key={movie.tmdbId}
                  className={cx(
                    "group relative overflow-hidden rounded-2xl",
                    "border border-white/10 bg-white/5 backdrop-blur",
                    "shadow-[0_18px_60px_rgba(0,0,0,0.55)]",
                    "transition-transform duration-300 hover:-translate-y-1"
                  )}
                >
                  {/* Poster */}
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0" />

                    {/* Top badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {year && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 border border-white/10 px-3 py-1 text-xs text-white/85">
                          <Calendar size={14} className="opacity-80" />
                          {year}
                        </span>
                      )}
                    </div>

                    {/* Bottom title */}
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-lg font-semibold leading-snug line-clamp-2">
                        {movie.title}
                      </h3>
                      <p className="mt-1 text-xs text-white/70">
                        {movie.releaseDate
                          ? new Date(movie.releaseDate).toLocaleDateString("vi-VN")
                          : ""}
                      </p>
                    </div>

                    {/* Hover shine */}
                    <div className="pointer-events-none absolute -inset-x-20 -top-20 h-40 rotate-12 bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/user/movies/${movie.tmdbId}`}
                        className={cx(
                          "inline-flex items-center justify-center gap-2",
                          "rounded-xl px-3 py-2 text-sm font-semibold",
                          "border border-white/15 bg-white/5 text-white/85",
                          "hover:bg-white/10 transition"
                        )}
                      >
                        <Info size={16} className="opacity-80" />
                        Chi tiết
                      </Link>

                      <Link
                        href={`/user/movies/${movie.tmdbId}`}
                        className={cx(
                          "inline-flex items-center justify-center gap-2",
                          "rounded-xl px-3 py-2 text-sm font-semibold",
                          "bg-emerald-400 text-black hover:bg-emerald-300 transition",
                          "shadow-[0_12px_35px_rgba(16,185,129,0.22)]"
                        )}
                      >
                        <Ticket size={16} />
                        Đặt vé
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
