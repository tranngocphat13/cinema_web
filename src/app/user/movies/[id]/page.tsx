"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Star, MapPin, Clock, Ticket, ArrowDown } from "lucide-react";
import CinemaSeatPicker from "@/components/forms/CinemaSeat";
import { useI18n } from "@/components/i18n/i18nProvider";
import {
  formatShowtimePickerDate,
  formatShowtimeHour,
  formatReleaseDate,
} from "@/lib/formatDate";

interface Cinema {
  _id: string;
  name: string;
}

interface Showtime {
  _id: string;
  cinema: { _id: string; name?: string };
  room: { _id: string; name?: string };
  startTime: string;
}

interface Seat {
  _id: string;
  number: string;
  type: "normal" | "vip" | "couple";
  isAvailable: boolean;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl?: string;
  isVoice?: boolean;
}

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  titleEn?: string;
  titleVi?: string;
  originalTitle?: string;
  overview?: string;
  overviewEn?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseDate?: string;
  ratingLabel?: string;
  runtime?: number;
  genres?: string[];
  countries?: string[];
  isAnimation?: boolean;
  cast?: CastMember[];
}

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function normalizeShowtimesPayload(payload: unknown): Showtime[] {
  if (Array.isArray(payload)) return payload as Showtime[];
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (Array.isArray(p.showtimes)) return p.showtimes as Showtime[];
    if (Array.isArray(p.data)) return p.data as Showtime[];
  }
  return [];
}

const TICKET_PRICES: Record<"normal" | "vip" | "couple", number> = {
  normal: 80000,
  vip: 120000,
  couple: 150000,
};

function getHighResTMDBUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/\/t\/p\/(w\d+|w780|w500|w300|w1280)\//, "/t/p/original/");
}

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useI18n();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  const [selectedCinemaId, setSelectedCinemaId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const ticketPrices = TICKET_PRICES;

  const formatMoney = (amount: number) => {
    if (lang === "en") {
      return `${amount.toLocaleString("en-US")} VND`;
    }
    return `${amount.toLocaleString("vi-VN")}đ`;
  };

  const selectedCinema = useMemo(
    () => cinemas.find((c) => c._id === selectedCinemaId) || null,
    [cinemas, selectedCinemaId]
  );

  const selectedShowtime = useMemo(
    () => showtimes.find((s) => s._id === selectedShowtimeId) || null,
    [showtimes, selectedShowtimeId]
  );

  const selectedSeatNumbers = useMemo(() => {
    return selectedSeats
      .map((sid) => seats.find((s) => s._id === sid)?.number)
      .filter(Boolean) as string[];
  }, [selectedSeats, seats]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find((s) => s._id === seatId);
      return seat ? sum + ticketPrices[seat.type] : sum;
    }, 0);
  }, [selectedSeats, seats, ticketPrices]);

  // Load movie
  useEffect(() => {
    fetch(`/api/movies/${id}?lang=${lang}`)
      .then((res) => res.json())
      .then(setMovie)
      .catch((e) => {
        console.error("GET /api/movies/:id error:", e);
        setMovie(null);
      });
  }, [id, lang]);

  // Load cinemas
  useEffect(() => {
    fetch(`/api/cinemas`)
      .then((res) => res.json())
      .then(setCinemas)
      .catch((e) => console.error("GET /api/cinemas error:", e));
  }, []);

  // Load showtimes
  useEffect(() => {
    const run = async () => {
      if (!selectedCinemaId || !movie) return;

      const queryParam = `movieId=${encodeURIComponent(movie._id ?? String(movie.tmdbId))}`;
      const url = `/api/showtimes?${queryParam}&cinemaId=${encodeURIComponent(selectedCinemaId)}`;
      const res = await fetch(url);

      if (!res.ok) {
        setShowtimes([]);
        setDates([]);
        return;
      }

      const payload = await res.json();
      const arr = normalizeShowtimesPayload(payload);
      setShowtimes(arr);

      const uniqueDates = Array.from(
        new Set(arr.map((st) => new Date(st.startTime).toDateString()))
      );
      setDates(uniqueDates);
    };

    run().catch((e) => {
      console.error("Load showtimes error:", e);
      setShowtimes([]);
      setDates([]);
    });
  }, [selectedCinemaId, movie]);

  // Load seats by showtime
  const fetchSeatsByShowtime = async (showtimeId: string) => {
    try {
      const res = await fetch(`/api/showtimes/${showtimeId}/seats`);
      if (!res.ok) {
        setSeats([]);
        return;
      }
      const data: unknown = await res.json();
      const arr = Array.isArray(data) ? (data as Seat[]) : [];
      setSeats(arr);
    } catch (err) {
      console.error(err);
      setSeats([]);
    }
  };

  const onConfirm = () => {
    if (!movie || !selectedShowtimeId || !selectedDate || selectedSeats.length === 0) return;

    const time = selectedShowtime ? formatShowtimeHour(selectedShowtime.startTime, lang) : "";
    const seatNumbers = selectedSeatNumbers.join(",");
    const firstSeat = seats.find((s) => s._id === selectedSeats[0]);
    const ticketType = firstSeat?.type || "normal";
    const seatIdsParam = selectedSeats.join(",");

    router.push(
      `/user/booking/detail?movieTitle=${encodeURIComponent(movie.title)}&movieId=${encodeURIComponent(
        String(id)
      )}&date=${encodeURIComponent(selectedDate)}&time=${encodeURIComponent(time)}&seats=${encodeURIComponent(
        seatNumbers
      )}&seatIds=${encodeURIComponent(seatIdsParam)}&total=${totalPrice}&showtimeId=${selectedShowtimeId}&ticketType=${ticketType}`
    );
  };

  const displayMovieTitle = movie ? (lang === "en" ? (movie.titleEn || movie.originalTitle || movie.title) : movie.title) : "";
  const displayOverview = movie ? (lang === "en" ? (movie.overviewEn || movie.overview) : movie.overview) : "";

  const backdropSrc = movie ? getHighResTMDBUrl(movie.backdropUrl || movie.posterUrl) : "";

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#e2e2e2] pb-16">
      {/* 1. Hero Split Section */}
      <section className="relative w-full min-h-[560px] lg:min-h-[640px] flex items-center border-b border-[#2c2c2c] overflow-hidden">
        {/* Full-width Widescreen Backdrop Image */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {backdropSrc ? (
            <Image
              src={backdropSrc}
              alt={displayMovieTitle}
              fill
              priority
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
            />
          ) : null}
          {/* Smooth cinema gradient overlays for text readability and seamless bottom blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121414]/95 via-[#121414]/65 to-[#121414]/25" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#121414] via-[#121414]/50 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#121414]/70 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 relative z-20 flex flex-col lg:flex-row gap-10">
          {/* Left Column: Metadata */}
          <div className="w-full lg:w-[48%] flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff2424] mb-2">
              {lang === "en" ? "NOW SHOWING" : "PHIM ĐANG CHIẾU"}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              {displayMovieTitle}
            </h1>

            <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] gap-y-3 text-sm text-white/70">
              <span className="text-white/50">{t("movies.rating") || (lang === "en" ? "Rating" : "Đánh giá")}:</span>
              <div className="flex items-center gap-2 text-white">
                <span className="font-bold text-[#ff2424]">4.5</span>
                <div className="flex items-center text-[#ff2424]">
                  <Star size={14} fill="#ff2424" />
                  <Star size={14} fill="#ff2424" />
                  <Star size={14} fill="#ff2424" />
                  <Star size={14} fill="#ff2424" />
                  <Star size={14} className="opacity-30" />
                </div>
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <>
                  <span className="text-white/50">{t("movies.genre") || (lang === "en" ? "Genre" : "Thể loại")}:</span>
                  <span className="text-white font-medium">{movie.genres.join(", ")}</span>
                </>
              )}

              <span className="text-white/50">{t("movies.format") || (lang === "en" ? "Format" : "Định dạng")}:</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded border border-[#2c2c2c] bg-[#1a1a1a] text-xs uppercase font-semibold text-white">
                  IMAX 3D
                </span>
                <span className="px-2 py-0.5 rounded border border-[#2c2c2c] bg-[#1a1a1a] text-xs uppercase font-semibold text-white">
                  2D Digital
                </span>
              </div>

              {movie.runtime && (
                <>
                  <span className="text-white/50">{t("movies.duration") || (lang === "en" ? "Duration" : "Thời lượng")}:</span>
                  <span className="text-white">{movie.runtime} {lang === "en" ? "min" : "phút"}</span>
                </>
              )}

              {movie.releaseDate && (
                <>
                  <span className="text-white/50">{t("movies.releaseDate") || (lang === "en" ? "Release date" : "Khởi chiếu")}:</span>
                  <span className="text-white">{formatReleaseDate(movie.releaseDate, lang)}</span>
                </>
              )}

              {movie.countries && movie.countries.length > 0 && (
                <>
                  <span className="text-white/50">{t("movies.country") || (lang === "en" ? "Country" : "Quốc gia")}:</span>
                  <span className="text-white">{movie.countries.join(", ")}</span>
                </>
              )}

              {movie.ratingLabel && (
                <>
                  <span className="text-white/50">MPAA:</span>
                  <span className="text-white font-semibold">{movie.ratingLabel}</span>
                </>
              )}

              {movie.cast && movie.cast.length > 0 && (
                <>
                  <span className="text-white/50">
                    {movie.isAnimation || movie.cast.some((c) => c.isVoice)
                      ? (lang === "en" ? "Voice cast:" : "Lồng tiếng:")
                      : (lang === "en" ? "Starring:" : "Diễn viên:")}
                  </span>
                  <span className="text-white font-medium line-clamp-2">
                    {movie.cast
                      .slice(0, 4)
                      .map((c) => c.name)
                      .join(", ")}
                  </span>
                </>
              )}
            </div>

            <a
              href="#booking-section"
              className="mt-8 flex items-center gap-3 text-xs uppercase tracking-widest text-white/70 hover:text-[#ff2424] transition-colors group w-fit"
            >
              <div className="w-8 h-8 rounded-full border border-[#2c2c2c] flex items-center justify-center group-hover:border-[#ff2424] group-hover:bg-[#ff2424]/10 transition-all">
                <ArrowDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </div>
              <span>{lang === "en" ? "ORDER A TICKET RIGHT NOW" : "ĐẶT VÉ NGAY BÂY GIỜ"}</span>
            </a>
          </div>

          {/* Right Column: Starring & Film Description */}
          <div className="w-full lg:w-[52%] flex flex-col justify-end lg:pl-8 lg:border-l border-[#2c2c2c] space-y-6">
            {/* Cast & Voice Actors Section */}
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
                    {movie.isAnimation || movie.cast.some((c) => c.isVoice)
                      ? (lang === "en" ? "Voice Cast:" : "Lồng tiếng:")
                      : (lang === "en" ? "Starring:" : "Diễn viên:")}
                  </h3>
                  <span className="w-10 h-0.5 bg-[#ff2424]" />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {movie.cast.slice(0, 4).map((actor) => (
                    <div
                      key={actor.id}
                      className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[#2c2c2c] bg-[#121414] shadow-xl hover:border-[#ff2424]/60 transition-all flex flex-col justify-end p-2.5"
                    >
                      {actor.profileUrl ? (
                        <Image
                          src={actor.profileUrl}
                          alt={actor.name}
                          fill
                          sizes="(max-width: 768px) 25vw, 150px"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1e2020] flex items-center justify-center text-white/30 font-bold text-lg">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />
                      <div className="relative z-10 text-center">
                        <p className="text-xs sm:text-sm font-bold text-white leading-tight line-clamp-1 drop-shadow-md">
                          {actor.name}
                        </p>
                        {actor.character && (
                          <p className="text-[10px] sm:text-[11px] text-[#ff2424] line-clamp-1 font-medium mt-0.5" title={actor.character}>
                            {actor.character}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Film Description */}
            {displayOverview && (
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-[#ff2424] rounded-sm" />
                  {lang === "en" ? "Film description:" : "Nội dung phim:"}
                </h3>
                <p className="text-sm text-white/70 leading-relaxed max-w-xl">
                  {displayOverview}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Booking Section */}
      <section id="booking-section" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8 pb-3 border-b border-[#2c2c2c]">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ff2424] font-bold">
              {lang === "en" ? "BOOKING PROCESS" : "QUY TRÌNH ĐẶT VÉ"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
              {lang === "en" ? "Select Cinema, Showtime & Seats" : "Chọn Rạp, Suất Chiếu & Ghế Ngồi"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* LEFT: Steps */}
          <div className="space-y-8">
            {/* Step 1: Cinema Selection */}
            <div className="p-6 rounded-xl border border-[#2c2c2c] bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#ff2424] text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t("movies.selectCinema")}
                  </h3>
                </div>
                {selectedCinema && (
                  <span className="text-xs text-[#ff2424] font-bold bg-[#ff2424]/10 border border-[#ff2424]/30 px-3 py-1 rounded">
                    {selectedCinema.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2.5">
                {cinemas.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => {
                      setSelectedCinemaId(c._id);
                      setSelectedDate(null);
                      setSelectedShowtimeId(null);
                      setSeats([]);
                      setSelectedSeats([]);
                    }}
                    className={cx(
                      "px-4 py-2 rounded border text-xs sm:text-sm font-semibold transition uppercase tracking-wider",
                      selectedCinemaId === c._id
                        ? "bg-[#ff2424] text-white border-[#ff2424] shadow-[0_0_15px_rgba(255,36,36,0.35)]"
                        : "border-[#2c2c2c] bg-[#121414] text-white/80 hover:border-white/40 hover:text-white"
                    )}
                  >
                    <MapPin size={14} className="inline mr-1.5 opacity-80" />
                    {c.name}
                  </button>
                ))}
                {cinemas.length === 0 && (
                  <div className="text-white/50 text-xs italic">
                    {lang === "en" ? "No cinema locations available." : "Chưa có danh sách rạp."}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Date Selection */}
            <div className="p-6 rounded-xl border border-[#2c2c2c] bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#ff2424] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t("movies.selectDate")}
                  </h3>
                </div>
                {selectedDate && (
                  <span className="text-xs text-white/80 bg-[#121414] border border-[#2c2c2c] px-3 py-1 rounded">
                    {formatShowtimePickerDate(selectedDate, lang).fullDate}
                  </span>
                )}
              </div>

              {dates.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {dates.map((d) => {
                    const label = formatShowtimePickerDate(d, lang);
                    const isSelected = selectedDate === d;
                    return (
                      <button
                        key={d}
                        onClick={() => {
                          setSelectedDate(d);
                          setSelectedShowtimeId(null);
                          setSeats([]);
                          setSelectedSeats([]);
                        }}
                        className={cx(
                          "w-20 h-24 rounded border flex flex-col items-center justify-center gap-1 shrink-0 transition-all duration-200",
                          isSelected
                            ? "border-2 border-[#ff2424] bg-[#121414] text-white shadow-[0_0_15px_rgba(255,36,36,0.25)] scale-105"
                            : "border-[#2c2c2c] bg-[#121414] text-white/70 hover:border-white/30 hover:text-white"
                        )}
                      >
                        <span className="text-[11px] uppercase font-bold text-white/50">{label.dow}</span>
                        <span className={cx("text-2xl font-black", isSelected ? "text-[#ff2424]" : "text-white")}>
                          {label.md.split("/")[0] || label.md}
                        </span>
                        <span className="text-[10px] text-white/40">{label.md}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-white/50 text-xs italic">
                  {selectedCinemaId
                    ? (lang === "en" ? "No showtimes for this cinema." : "Không có suất chiếu cho rạp này.")
                    : (lang === "en" ? "Please select a cinema first." : "Hãy chọn rạp trước.")}
                </div>
              )}
            </div>

            {/* Step 3: Showtime Selection */}
            <div className="p-6 rounded-xl border border-[#2c2c2c] bg-[#1a1a1a]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#ff2424] text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t("movies.selectShowtime")}
                  </h3>
                </div>
                {selectedShowtime && (
                  <span className="text-xs text-[#ff2424] font-bold bg-[#ff2424]/10 border border-[#ff2424]/30 px-3 py-1 rounded">
                    {formatShowtimeHour(selectedShowtime.startTime, lang)}
                  </span>
                )}
              </div>

              {selectedDate ? (
                <div className="flex flex-wrap gap-2.5">
                  {showtimes
                    .filter((st) => new Date(st.startTime).toDateString() === selectedDate)
                    .map((st) => {
                      const now = new Date();
                      const start = new Date(st.startTime);
                      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                      const isOngoing = now >= start && now < end;
                      const isPast = now >= end;
                      const isSelected = selectedShowtimeId === st._id;

                      return (
                        <button
                          key={st._id}
                          disabled={isOngoing || isPast}
                          onClick={() => {
                            if (isOngoing || isPast) return;
                            setSelectedShowtimeId(st._id);
                            setSelectedSeats([]);
                            fetchSeatsByShowtime(st._id);
                          }}
                          className={cx(
                            "px-4 py-2.5 rounded border text-xs sm:text-sm font-semibold transition uppercase tracking-wider font-mono",
                            isOngoing || isPast
                              ? "bg-[#121414]/50 border-[#2c2c2c] text-white/20 cursor-not-allowed opacity-40"
                              : isSelected
                              ? "bg-[#ff2424] text-white border-[#ff2424] shadow-[0_0_15px_rgba(255,36,36,0.4)]"
                              : "border-[#2c2c2c] bg-[#121414] text-white/80 hover:border-white/40 hover:text-white"
                          )}
                        >
                          <Clock size={14} className="inline mr-1.5 opacity-80" />
                          {formatShowtimeHour(st.startTime, lang)}
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="text-white/50 text-xs italic">
                  {lang === "en" ? "Please select a date first." : "Hãy chọn ngày trước."}
                </div>
              )}
            </div>

            {/* Step 4: Seat Picker */}
            {selectedShowtimeId && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#ff2424] text-white flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <h3 className="text-base font-bold text-white uppercase tracking-wider">
                    {t("movies.seats")}
                  </h3>
                </div>

                <CinemaSeatPicker
                  seats={seats}
                  selectedSeatIds={selectedSeats}
                  onChangeSelectedIds={setSelectedSeats}
                  ticketPrices={ticketPrices}
                  maxSelected={8}
                />
              </div>
            )}
          </div>

          {/* RIGHT: Booking Summary */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-6 shadow-2xl space-y-6">
              <div className="flex gap-4 items-center pb-4 border-b border-[#2c2c2c]">
                <div className="relative w-20 h-28 rounded overflow-hidden border border-[#2c2c2c] shrink-0">
                  {movie.posterUrl ? (
                    <Image src={movie.posterUrl} alt={displayMovieTitle} fill className="object-cover" />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2">{displayMovieTitle}</h3>
                  <p className="text-xs text-[#ff2424] font-semibold mt-1">IMAX 3D</p>
                  {movie.runtime && (
                    <p className="text-xs text-white/50 mt-0.5">{movie.runtime} {lang === "en" ? "min" : "phút"}</p>
                  )}
                </div>
              </div>

              {/* Detail rows */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2c2c2c]/50">
                  <span className="text-white/50 uppercase tracking-wider">{t("movies.theater") || "Cinema"}:</span>
                  <span className="font-semibold text-white">{selectedCinema?.name || "-"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2c2c2c]/50">
                  <span className="text-white/50 uppercase tracking-wider">{t("movies.date") || "Date"}:</span>
                  <span className="font-semibold text-white">
                    {selectedDate ? formatShowtimePickerDate(selectedDate, lang).fullDate : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2c2c2c]/50">
                  <span className="text-white/50 uppercase tracking-wider">{t("movies.time") || "Time"}:</span>
                  <span className="font-semibold text-white">
                    {selectedShowtime ? formatShowtimeHour(selectedShowtime.startTime, lang) : "-"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2c2c2c]/50">
                  <span className="text-white/50 uppercase tracking-wider">{t("movies.seats") || "Seats"}:</span>
                  <span className="font-bold text-[#ff2424]">{selectedSeatNumbers.join(", ") || "-"}</span>
                </div>
              </div>

              {/* Total Box */}
              <div className="p-4 rounded bg-[#121414] border border-[#2c2c2c]">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-white/60">{t("common.total") || "Total"}:</span>
                  <span className="text-xl font-black text-[#ff2424]">{formatMoney(totalPrice)}</span>
                </div>
                <div className="text-[10px] text-white/40 mt-1">
                  Normal: {formatMoney(ticketPrices.normal)} · VIP: {formatMoney(ticketPrices.vip)} · Couple: {formatMoney(ticketPrices.couple)}
                </div>
              </div>

              {/* Confirm & Book CTA */}
              <button
                onClick={onConfirm}
                disabled={!selectedShowtimeId || selectedSeats.length === 0 || !selectedDate}
                className="w-full py-4 rounded bg-[#ff2424] hover:bg-[#e01e1e] text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,36,36,0.35)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Ticket size={18} />
                <span>{t("common.confirm")} & {t("movies.book")}</span>
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

