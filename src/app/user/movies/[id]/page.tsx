"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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

interface Movie {
  _id?: string;
  tmdbId: number;
  title: string;
  titleEn?: string;
  titleVi?: string;
  originalTitle?: string;
  overview?: string;
  posterUrl?: string;
  releaseDate?: string;
  ratingLabel?: string;
  runtime?: number;
  genres?: string[];
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

  const ticketPrices: Record<"normal" | "vip" | "couple", number> = {
    normal: 80000,
    vip: 120000,
    couple: 150000,
  };

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
  }, [selectedSeats, seats]);

  // Load movie with lang parameter
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

  if (!movie) return <p className="text-center text-white mt-10">{t("common.loading")}</p>;

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 text-white
                    bg-[radial-gradient(1200px_600px_at_50%_10%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(to_bottom,#020403,#020403,#000)]"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">{displayMovieTitle}</h1>
          <p className="text-white/60 text-sm">
            {lang === "en"
              ? "Select cinema → date → showtime → seats. Then confirm to proceed to checkout."
              : "Chọn rạp → ngày → suất chiếu → ghế. Sau đó xác nhận để qua trang thanh toán."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
          {/* LEFT: Steps */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
            {/* Step 1: Cinema */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] tracking-[0.24em] text-white/50 uppercase">Step 1</p>
                <h3 className="text-lg font-semibold">{t("movies.selectCinema")}</h3>
              </div>
              {selectedCinema && (
                <span className="text-xs text-emerald-200 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full">
                  {lang === "en" ? `Selected: ${selectedCinema.name}` : `Đã chọn: ${selectedCinema.name}`}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
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
                    "px-4 py-2 rounded-full border text-sm transition",
                    selectedCinemaId === c._id
                      ? "bg-emerald-400 text-black border-emerald-300 shadow-[0_10px_35px_rgba(16,185,129,0.22)]"
                      : "border-white/15 text-white/80 hover:bg-white/10"
                  )}
                >
                  <span className="mr-1">📍</span>
                  {c.name}
                </button>
              ))}
              {cinemas.length === 0 && (
                <div className="text-white/60 text-sm">
                  {lang === "en" ? "No cinema locations available." : "Chưa có danh sách rạp."}
                </div>
              )}
            </div>

            {/* Step 2: Date */}
            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] tracking-[0.24em] text-white/50 uppercase">Step 2</p>
                  <h3 className="text-lg font-semibold">{t("movies.selectDate")}</h3>
                </div>
                {selectedDate && (
                  <span className="text-xs text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {formatShowtimePickerDate(selectedDate, lang).fullDate}
                  </span>
                )}
              </div>

              {dates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dates.map((d) => {
                    const label = formatShowtimePickerDate(d, lang);
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
                          "w-[102px] rounded-2xl border px-3 py-2.5 text-left transition",
                          selectedDate === d
                            ? "bg-emerald-400/15 border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                            : "border-white/12 hover:bg-white/10"
                        )}
                      >
                        <div className="text-[11px] text-white/60">{label.md}</div>
                        <div className="text-base font-bold text-white leading-tight mt-0.5">{label.dow}</div>
                        <div className="text-[10px] text-white/40">{label.y}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-white/55 text-sm">
                  {selectedCinemaId
                    ? (lang === "en" ? "No showtimes for this cinema." : "Không có suất chiếu cho rạp này.")
                    : (lang === "en" ? "Please select a cinema first." : "Hãy chọn rạp trước.")}
                </div>
              )}
            </div>

            {/* Step 3: Time */}
            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[11px] tracking-[0.24em] text-white/50 uppercase">Step 3</p>
                  <h3 className="text-lg font-semibold">{t("movies.selectShowtime")}</h3>
                </div>
                {selectedShowtime && (
                  <span className="text-xs text-white/70 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {formatShowtimeHour(selectedShowtime.startTime, lang)}
                  </span>
                )}
              </div>

              {selectedDate ? (
                <div className="flex flex-wrap gap-2">
                  {showtimes
                    .filter((st) => new Date(st.startTime).toDateString() === selectedDate)
                    .map((st) => {
                      const now = new Date();
                      const start = new Date(st.startTime);
                      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                      const isOngoing = now >= start && now < end;
                      const isPast = now >= end;

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
                            "px-4 py-2 rounded-xl border transition text-sm font-medium",
                            isOngoing || isPast
                              ? "bg-white/5 border-white/10 text-white/35 cursor-not-allowed"
                              : selectedShowtimeId === st._id
                              ? "bg-emerald-400 text-black border-emerald-300 font-semibold shadow-[0_4px_15px_rgba(16,185,129,0.3)]"
                              : "border-white/15 text-white/80 hover:bg-white/10"
                          )}
                        >
                          {formatShowtimeHour(st.startTime, lang)}
                        </button>
                      );
                    })}
                </div>
              ) : (
                <div className="text-white/55 text-sm">
                  {lang === "en" ? "Please select a date first." : "Hãy chọn ngày trước."}
                </div>
              )}
            </div>

            {/* Step 4: Seats */}
            {selectedShowtimeId && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[11px] tracking-[0.24em] text-white/50 uppercase">Step 4</p>
                    <h3 className="text-lg font-semibold">{t("movies.seats")}</h3>
                  </div>
                  <div className="text-sm text-white/70">
                    {t("common.total")}:{" "}
                    <span className="font-bold text-emerald-300">{formatMoney(totalPrice)}</span>
                  </div>
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

          {/* RIGHT: Summary */}
          <aside className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.45)]">
              <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-white/10 bg-white/5">
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={displayMovieTitle} fill className="object-cover" priority />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white/40 text-xs">No Poster</div>
                )}
              </div>

              <div className="mt-4">
                <h2 className="text-xl font-bold">{displayMovieTitle}</h2>
                {movie.releaseDate && (
                  <p className="text-xs text-white/50 mt-1">
                    {t("movies.releaseDate")}: {formatReleaseDate(movie.releaseDate, lang)}
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <Row
                  label={t("movies.theater")}
                  value={selectedCinema?.name || (lang === "en" ? "Not selected" : "Chưa chọn")}
                />
                <Row
                  label={t("movies.date")}
                  value={
                    selectedDate
                      ? formatShowtimePickerDate(selectedDate, lang).fullDate
                      : (lang === "en" ? "Not selected" : "Chưa chọn")
                  }
                />
                <Row
                  label={t("movies.time")}
                  value={
                    selectedShowtime
                      ? formatShowtimeHour(selectedShowtime.startTime, lang)
                      : (lang === "en" ? "Not selected" : "Chưa chọn")
                  }
                />
                <Row
                  label={t("movies.seats")}
                  value={
                    selectedSeatNumbers.length
                      ? selectedSeatNumbers.join(", ")
                      : (lang === "en" ? "Not selected" : "Chưa chọn")
                  }
                />
              </div>

              <div className="mt-5 rounded-xl bg-black/30 border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">{t("common.total")}</span>
                  <span className="text-lg font-extrabold text-emerald-300">{formatMoney(totalPrice)}</span>
                </div>
                <div className="text-xs text-white/50 mt-1">
                  {lang === "en"
                    ? `Price: Regular ${formatMoney(ticketPrices.normal)} · VIP ${formatMoney(ticketPrices.vip)} · Couple ${formatMoney(ticketPrices.couple)}`
                    : `Giá: Thường ${formatMoney(ticketPrices.normal)} · VIP ${formatMoney(ticketPrices.vip)} · Đôi ${formatMoney(ticketPrices.couple)}`}
                </div>
              </div>

              <button
                onClick={onConfirm}
                disabled={!selectedShowtimeId || selectedSeats.length === 0 || !selectedDate}
                className="mt-5 w-full py-3 rounded-xl bg-emerald-400 text-black font-bold hover:bg-emerald-300 transition
                           disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_25px_rgba(16,185,129,0.25)]"
              >
                {t("common.confirm")} & {t("movies.book")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/55">{label}</span>
      <span className="text-white font-medium text-right break-words">{value}</span>
    </div>
  );
}
