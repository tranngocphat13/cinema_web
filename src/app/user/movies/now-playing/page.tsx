"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Ticket as TicketIcon, Info } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  releaseDate: string;
  posterUrl: string;
}

const fetcher = async (url: string): Promise<Movie[]> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Fetch failed");
  return (await res.json()) as Movie[];
};


function yearFrom(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? "" : String(d.getFullYear());
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function NowPlayingPage() {
  const { t, lang } = useI18n();

  // ✅ quan trọng: key của SWR phải đổi theo lang để refetch
  const apiUrl = `/api/movies/now-playing?status=now_playing&lang=${lang}`;
  const { data, error } = useSWR<Movie[]>(apiUrl, fetcher);
  const isLoading = !data && !error;

  const locale = lang === "en" ? "en-US" : "vi-VN";
  const topLabel = lang === "en" ? "MYCINEMA • NOW PLAYING" : "MYCINEMA • PHIM ĐANG CHIẾU";
  const subtitle =
    lang === "en"
      ? "Pick a movie you love and book in seconds."
      : "Chọn phim bạn thích và đặt vé nhanh chóng.";

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center gap-2 mb-10">
          <p className="text-[11px] tracking-[0.26em] uppercase text-emerald-200/70">{topLabel}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold">{t("movies.nowShowingTitle")}</h1>
          <p className="max-w-2xl text-white/60 text-sm sm:text-base">{subtitle}</p>
        </div>

        {error && (
          <p className="text-center text-red-300">{lang === "en" ? "Failed to load data!" : "Lỗi tải dữ liệu!"}</p>
        )}
        {isLoading && <p className="text-center text-white/70">{t("common.loading")}</p>}

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
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority={false}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/0" />

                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      {year && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/45 border border-white/10 px-3 py-1 text-xs text-white/85">
                          <Calendar size={14} className="opacity-80" />
                          {year}
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <h3 className="text-lg font-semibold leading-snug line-clamp-2">{movie.title}</h3>
                      <p className="mt-1 text-xs text-white/70">
                        {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString(locale) : ""}
                      </p>
                    </div>

                    <div className="pointer-events-none absolute -inset-x-20 -top-20 h-40 rotate-12 bg-white/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

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
                        {t("movies.detail")}
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
                        <TicketIcon size={16} />
                        {t("movies.book")}
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
