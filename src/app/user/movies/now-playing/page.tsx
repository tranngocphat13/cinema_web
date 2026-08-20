"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Ticket, Star, ChevronRight, ChevronLeft, Info } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  titleEn?: string;
  titleVi?: string;
  originalTitle?: string;
  releaseDate?: string;
  posterUrl?: string;
  backdropUrl?: string;
  overview?: string;
  genres?: string[];
  runtime?: number;
  ratingLabel?: string;
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

function getHighResTMDBUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/\/t\/p\/(w\d+|w780|w500|w300|w1280)\//, "/t/p/original/");
}

export default function NowPlayingPage() {
  const { t, lang } = useI18n();
  const [heroIndex, setHeroIndex] = useState(0);

  const apiUrl = `/api/movies/now-playing?status=now_playing&lang=${lang}`;
  const { data, error } = useSWR<Movie[]>(apiUrl, fetcher);
  const isLoading = !data && !error;

  const moviesWithBackdrops = (data || []).filter((m) => m.backdropUrl || m.posterUrl);
  const featuredMovies = moviesWithBackdrops.slice(0, 6);
  const heroMovie = featuredMovies[heroIndex] || (data && data.length > 0 ? data[0] : null);
  const gridMovies = data || [];

  // Auto rotate hero every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  return (
    <div className="min-h-screen text-[#e2e2e2] pb-16">
      {isLoading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
            <p className="text-white/60 text-sm">{t("common.loading")}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <p className="text-red-400 font-semibold">{t("common.error")}</p>
        </div>
      )}

      {heroMovie && (
        <section className="relative w-full h-[580px] sm:h-[680px] lg:h-[760px] flex items-end justify-start px-4 sm:px-8 lg:px-16 pb-12 mb-12 border-b border-[#2c2c2c] overflow-hidden group">
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            {heroMovie.backdropUrl || heroMovie.posterUrl ? (
              <Image
                key={heroMovie.backdropUrl || heroMovie.posterUrl}
                src={getHighResTMDBUrl(heroMovie.backdropUrl || heroMovie.posterUrl)}
                alt={heroMovie.title}
                fill
                priority
                unoptimized
                className="object-cover object-center scale-100"
                sizes="100vw"
              />
            ) : null}
            {/* Subtle soft left gradient only behind the title text */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#121414]/90 via-[#121414]/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#121414] via-[#121414]/40 to-transparent pointer-events-none" />
          </div>

          {/* Left / Right Nav Buttons */}
          {featuredMovies.length > 1 && (
            <>
              <button
                onClick={() => setHeroIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#121414]/70 hover:bg-[#ff2424] border border-[#2c2c2c] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Previous movie"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={() => setHeroIndex((prev) => (prev + 1) % featuredMovies.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-[#121414]/70 hover:bg-[#ff2424] border border-[#2c2c2c] text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                aria-label="Next movie"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Hero Content */}
          <div className="relative z-10 max-w-2xl flex flex-col gap-3">
            <div className="flex flex-wrap gap-2 mb-1">
              <span className="border border-[#2c2c2c] bg-[#121414]/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                IMAX 3D
              </span>
              <span className="border border-[#2c2c2c] bg-[#121414]/80 backdrop-blur-sm text-[#ff2424] px-2.5 py-0.5 rounded text-xs uppercase tracking-wider font-semibold">
                {lang === "en" ? "FROM 80,000 VND" : "TỪ 80.000đ"}
              </span>
              {heroMovie.releaseDate && (
                <span className="border border-[#2c2c2c] bg-[#121414]/80 backdrop-blur-sm text-white/70 px-2.5 py-0.5 rounded text-xs uppercase tracking-wider">
                  {yearFrom(heroMovie.releaseDate)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {lang === "en" ? (heroMovie.titleEn || heroMovie.originalTitle || heroMovie.title) : heroMovie.title}
            </h1>

            {/* Rating Stars */}
            <div className="flex items-center gap-1 text-[#ff2424] my-1">
              <Star size={18} fill="#ff2424" />
              <Star size={18} fill="#ff2424" />
              <Star size={18} fill="#ff2424" />
              <Star size={18} fill="#ff2424" />
              <Star size={18} className="opacity-40" />
              <span className="text-xs text-white/70 ml-2 font-medium">4.5 / 5.0</span>
            </div>

            {heroMovie.overview && (
              <p className="text-white/75 text-sm sm:text-base line-clamp-3 mb-2 max-w-xl leading-relaxed">
                {heroMovie.overview}
              </p>
            )}

            {/* Quick Showtime Chips */}
            <div className="flex flex-wrap gap-2 my-2">
              {["16:50", "18:05", "19:00", "21:45"].map((time) => (
                <Link
                  key={time}
                  href={`/user/movies/${heroMovie._id ?? heroMovie.tmdbId}`}
                  className="bg-[#1a1a1a] text-white/90 hover:bg-[#ff2424] hover:text-white transition-colors border border-[#2c2c2c] px-3.5 py-1.5 rounded text-xs font-semibold"
                >
                  {time}
                </Link>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-2">
              <Link
                href={`/user/movies/${heroMovie._id ?? heroMovie.tmdbId}`}
                className="bg-[#ff2424] hover:bg-[#e01e1e] text-white font-bold px-7 py-3.5 rounded text-sm uppercase tracking-wider transition-colors shadow-[0_0_20px_rgba(255,36,36,0.4)] flex items-center gap-2"
              >
                <Ticket size={18} />
                {t("movies.book")}
              </Link>

              <Link
                href={`/user/movies/${heroMovie._id ?? heroMovie.tmdbId}`}
                className="border border-[#2c2c2c] bg-[#1a1a1a]/80 hover:bg-white/10 text-white font-medium px-5 py-3.5 rounded text-sm transition-colors flex items-center gap-1.5"
              >
                <Info size={16} className="opacity-80" />
                {t("movies.detail")}
              </Link>
            </div>
          </div>

          {/* Bottom Right Slide Indicators */}
          {featuredMovies.length > 1 && (
            <div className="absolute right-6 sm:right-12 bottom-8 z-20 flex items-center gap-2">
              {featuredMovies.map((m, idx) => (
                <button
                  key={m.tmdbId || idx}
                  onClick={() => setHeroIndex(idx)}
                  className={`h-2 transition-all rounded-full ${
                    heroIndex === idx
                      ? "w-8 bg-[#ff2424] shadow-[0_0_10px_rgba(255,36,36,0.8)]"
                      : "w-2 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Movies Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#2c2c2c]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ff2424] font-bold">
              {lang === "en" ? "NOW PLAYING" : "DANH SÁCH"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {t("movies.nowShowingTitle")}
            </h2>
          </div>
          <span className="text-xs text-white/50 uppercase tracking-wider">
            {gridMovies.length} {lang === "en" ? "Movies" : "Phim"}
          </span>
        </div>

        {gridMovies.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {gridMovies.map((movie) => {
              const year = yearFrom(movie.releaseDate);

              return (
                <Link
                  key={movie.tmdbId}
                  href={`/user/movies/${movie.tmdbId}`}
                  className={cx(
                    "group relative overflow-hidden rounded bg-[#1a1a1a] border border-[#2c2c2c]",
                    "aspect-[2/3] flex flex-col justify-end",
                    "transition-all duration-300 hover:border-[#ff2424] hover:shadow-[0_0_25px_rgba(255,36,36,0.25)]"
                  )}
                >
                  {/* Poster Image */}
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title || "Movie poster"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e2020] text-xs text-white/40">
                      No Poster
                    </div>
                  )}

                  {/* Scrim overlay */}
                  <div className="absolute inset-0 scrim-bottom z-10" />

                  {/* Content on poster */}
                  <div className="relative z-20 p-4 flex flex-col justify-end">
                    <div className="flex gap-1.5 mb-2">
                      <span className="border border-white/20 bg-black/40 text-white/90 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold backdrop-blur-sm">
                        IMAX 3D
                      </span>
                      {year && (
                        <span className="border border-white/20 bg-black/40 text-white/80 px-1.5 py-0.5 rounded text-[10px] backdrop-blur-sm">
                          {year}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-[#ff2424] transition-colors">
                      {movie.title}
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1 text-[#ff2424] my-1.5">
                      <Star size={12} fill="#ff2424" />
                      <Star size={12} fill="#ff2424" />
                      <Star size={12} fill="#ff2424" />
                      <Star size={12} fill="#ff2424" />
                      <Star size={12} className="opacity-40" />
                    </div>

                    {/* Showtimes & CTA */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10">
                      <div className="flex gap-1.5">
                        <span className="bg-[#121414]/90 text-white/80 border border-[#2c2c2c] px-2 py-0.5 rounded text-[11px] font-mono">
                          16:50
                        </span>
                        <span className="bg-[#121414]/90 text-white/80 border border-[#2c2c2c] px-2 py-0.5 rounded text-[11px] font-mono">
                          19:00
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#ff2424] flex items-center group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                        {t("movies.book")} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

