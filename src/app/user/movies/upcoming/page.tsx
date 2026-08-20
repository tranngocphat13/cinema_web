"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { Star, ChevronRight, ChevronLeft, Info, Play, X, Calendar, Sparkles, Film } from "lucide-react";
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
  trailerUrl?: string;
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

function formatDate(dateStr?: string, lang: "vi" | "en" = "vi") {
  if (!dateStr) return lang === "en" ? "Coming Soon" : "Sắp chiếu";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return lang === "en" ? "Coming Soon" : "Sắp chiếu";

  return d.toLocaleDateString(lang === "en" ? "en-US" : "vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function getHighResTMDBUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/\/t\/p\/(w\d+|w780|w500|w300|original)\//, "/t/p/w1280/");
}

function getEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  }
  return url;
}

export default function UpcomingMoviesPage() {
  const { t, lang } = useI18n();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeTrailer, setActiveTrailer] = useState<{ url: string; title: string } | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>("all");

  const apiUrl = `/api/movies/upcoming?lang=${lang}`;
  const { data, error } = useSWR<Movie[]>(apiUrl, fetcher);
  const isLoading = !data && !error;

  const moviesWithBackdrops = (data || []).filter((m) => m.backdropUrl || m.posterUrl);
  const featuredMovies = moviesWithBackdrops.slice(0, 6);
  const heroMovie = featuredMovies[heroIndex] || (data && data.length > 0 ? data[0] : null);

  // Extract unique genres for filter tabs
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    (data || []).forEach((m) => {
      (m.genres || []).forEach((g) => set.add(g));
    });
    return Array.from(set);
  }, [data]);

  // Filter movies by genre
  const filteredMovies = useMemo(() => {
    if (!data) return [];
    if (selectedGenre === "all") return data;
    return data.filter((m) => (m.genres || []).includes(selectedGenre));
  }, [data, selectedGenre]);

  // Auto rotate hero every 7 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  return (
    <div className="min-h-screen text-[#e2e2e2] pb-20">
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#121414]/95 via-[#121414]/50 to-transparent pointer-events-none" />
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
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="border border-[#ff2424]/40 bg-[#ff2424]/20 text-[#ff2424] px-3 py-1 rounded text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 backdrop-blur-sm">
                <Sparkles size={13} />
                {lang === "en" ? "COMING SOON" : "SẮP KHỞI CHIẾU"}
              </span>

              {heroMovie.releaseDate && (
                <span className="border border-white/20 bg-black/60 text-white px-3 py-1 rounded text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                  <Calendar size={13} className="text-[#ff2424]" />
                  {formatDate(heroMovie.releaseDate, lang)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight drop-shadow-md">
              {lang === "en" ? (heroMovie.titleEn || heroMovie.originalTitle || heroMovie.title) : heroMovie.title}
            </h1>

            {heroMovie.genres && heroMovie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 my-1">
                {heroMovie.genres.slice(0, 3).map((g) => (
                  <span key={g} className="text-xs text-white/70 bg-white/10 px-2.5 py-0.5 rounded border border-white/10">
                    {g}
                  </span>
                ))}
              </div>
            )}

            {heroMovie.overview && (
              <p className="text-white/75 text-sm sm:text-base line-clamp-3 mb-2 max-w-xl leading-relaxed">
                {heroMovie.overview}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {heroMovie.trailerUrl && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTrailer({
                      url: heroMovie.trailerUrl || "",
                      title: heroMovie.title,
                    })
                  }
                  className="bg-[#ff2424] hover:bg-[#e01e1e] text-white font-bold px-7 py-3.5 rounded text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,36,36,0.4)] flex items-center gap-2"
                >
                  <Play size={16} className="fill-current" />
                  {t("movies.trailer")}
                </button>
              )}

              <Link
                href={`/user/movies/${heroMovie.tmdbId || heroMovie._id}`}
                className="border border-[#2c2c2c] bg-[#1a1a1a]/90 hover:bg-white/10 text-white font-medium px-6 py-3.5 rounded text-sm transition-colors flex items-center gap-1.5"
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

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header & Genre Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#2c2c2c]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ff2424] font-bold">
              {lang === "en" ? "UPCOMING ATTRACTIONS" : "PHIM SẮP CHIẾU"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {t("movies.comingSoonTitle")}
            </h2>
          </div>

          {/* Genre Filters */}
          {allGenres.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                onClick={() => setSelectedGenre("all")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                  selectedGenre === "all"
                    ? "bg-[#ff2424] text-white shadow-[0_0_12px_rgba(255,36,36,0.4)] font-bold"
                    : "bg-[#1a1a1a] text-white/70 hover:text-white border border-[#2c2c2c]"
                }`}
              >
                {lang === "en" ? "All" : "Tất cả"}
              </button>
              {allGenres.map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                    selectedGenre === g
                      ? "bg-[#ff2424] text-white shadow-[0_0_12px_rgba(255,36,36,0.4)] font-bold"
                      : "bg-[#1a1a1a] text-white/70 hover:text-white border border-[#2c2c2c]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Movies Grid */}
        {filteredMovies.length === 0 ? (
          <div className="text-center py-16 bg-[#161818] rounded-2xl border border-[#2c2c2c]">
            <Film size={40} className="mx-auto text-white/30 mb-3" />
            <p className="text-white/60 text-sm">
              {lang === "en" ? "No upcoming movies found in this genre." : "Chưa có phim sắp chiếu thuộc thể loại này."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((movie) => {
              const releaseDateText = formatDate(movie.releaseDate, lang);

              return (
                <div
                  key={movie.tmdbId}
                  className="group relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-[#2c2c2c] aspect-[2/3] flex flex-col justify-end transition-all duration-300 hover:border-[#ff2424] hover:shadow-[0_0_25px_rgba(255,36,36,0.25)]"
                >
                  {/* Poster Image */}
                  {movie.posterUrl ? (
                    <Image
                      src={movie.posterUrl}
                      alt={movie.title || "Upcoming poster"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1e2020] text-xs text-white/40">
                      No Poster
                    </div>
                  )}

                  {/* Scrim Overlay */}
                  <div className="absolute inset-0 scrim-bottom z-10" />

                  {/* Top Release Date Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-black/75 backdrop-blur-md border border-[#ff2424]/40 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                      <Calendar size={12} className="text-[#ff2424]" />
                      <span>{releaseDateText}</span>
                    </span>
                  </div>

                  {/* Content on Poster */}
                  <div className="relative z-20 p-4 flex flex-col justify-end">
                    {movie.genres && movie.genres.length > 0 && (
                      <div className="flex gap-1.5 mb-1.5 flex-wrap">
                        {movie.genres.slice(0, 2).map((g) => (
                          <span key={g} className="border border-white/20 bg-black/50 text-white/80 px-1.5 py-0.5 rounded text-[10px] backdrop-blur-sm">
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-white leading-snug line-clamp-1 group-hover:text-[#ff2424] transition-colors">
                      {movie.title}
                    </h3>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-white/10">
                      {movie.trailerUrl ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActiveTrailer({
                              url: movie.trailerUrl || "",
                              title: movie.title,
                            });
                          }}
                          className="flex items-center gap-1.5 bg-[#121414]/90 hover:bg-[#ff2424] text-white/90 hover:text-white border border-[#2c2c2c] hover:border-[#ff2424] px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shadow-sm group/btn"
                        >
                          <Play size={12} className="fill-current text-[#ff2424] group-hover/btn:text-white transition-colors" />
                          <span>{t("movies.trailer")}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-white/40 italic flex items-center gap-1">
                          <Film size={12} /> IMAX
                        </span>
                      )}

                      <Link
                        href={`/user/movies/${movie.tmdbId || movie._id}`}
                        className="text-xs font-bold text-[#ff2424] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider hover:underline"
                      >
                        {t("movies.detail")} <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      {activeTrailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setActiveTrailer(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-[#121414] border border-[#2c2c2c] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#2c2c2c] bg-[#1a1a1a]">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-[#ff2424] fill-[#ff2424]" />
                <h3 className="font-bold text-white text-base truncate max-w-md">
                  {activeTrailer.title} — Trailer
                </h3>
              </div>
              <button
                onClick={() => setActiveTrailer(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#ff2424] text-white flex items-center justify-center transition-colors"
                aria-label="Close trailer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {getEmbedUrl(activeTrailer.url) ? (
                <iframe
                  src={getEmbedUrl(activeTrailer.url) || ""}
                  title={activeTrailer.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50 text-sm">
                  Trailer không khả dụng
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
