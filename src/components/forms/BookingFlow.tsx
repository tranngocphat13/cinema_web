"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Clock, Ticket, ShieldCheck, CreditCard, QrCode, ArrowLeft, Check } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";
import { cn } from "@/lib/utils";

interface CastMember {
  id: number;
  name: string;
  character?: string;
  profileUrl?: string;
  isVoice?: boolean;
}

interface MovieDetail {
  title?: string;
  titleEn?: string;
  overview?: string;
  cast?: CastMember[];
  posterUrl?: string;
  backdropUrl?: string;
  genres?: string[];
  runtime?: number;
  ratingLabel?: string;
  releaseDate?: string;
  isAnimation?: boolean;
}

type CheckoutStartResponse =
  | {
      ok: true;
      devAutoPaid?: boolean;
      booking?: { status?: "pending" | "paid" | "canceled" };
      bookingId?: string;
      message?: string;
      payUrl?: string;
    }
  | {
      ok?: false;
      error: string;
    };

export default function BookingDetail() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useI18n();

  const movieTitle = searchParams.get("movieTitle") ?? "";
  const movieId = searchParams.get("movieId") ?? "";
  const date = searchParams.get("date") ?? "";
  const time = searchParams.get("time") ?? "";
  const seats = searchParams.get("seats") ?? "";
  const seatIds = searchParams.get("seatIds") ?? "";
  const total = Number(searchParams.get("total") ?? "0");
  const showtimeId = searchParams.get("showtimeId") ?? "";
  const ticketType = searchParams.get("ticketType") ?? "normal";

  const [movieData, setMovieData] = useState<MovieDetail | null>(null);
  const [loadingDev, setLoadingDev] = useState(false);
  const [loadingVnpay, setLoadingVnpay] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"vnpay" | "dev">("vnpay");
  const [customerName, setCustomerName] = useState(session?.user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || "");
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Fetch movie details for cast and overview
  useEffect(() => {
    if (!movieId) return;
    let isMounted = true;
    fetch(`/api/movies/${encodeURIComponent(movieId)}?lang=${lang}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setMovieData(data);
        }
      })
      .catch((err) => console.error("Error loading movie detail:", err));

    return () => {
      isMounted = false;
    };
  }, [movieId, lang]);

  // 10-minute timer for reservation
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (session?.user?.name && !customerName) setCustomerName(session.user.name);
    if (session?.user?.email && !customerEmail) setCustomerEmail(session.user.email);
  }, [session, customerName, customerEmail]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const seatList = seats ? seats.split(",").filter(Boolean) : [];

  /** Thanh toán DEV auto (demo) */
  async function handleDevPay(): Promise<void> {
    if (!showtimeId || !seatIds || total <= 0) {
      alert(lang === "en" ? "Missing booking data" : "Thiếu dữ liệu thanh toán");
      return;
    }
    if (!agreeTerms) {
      alert(lang === "en" ? "Please agree to the cinema terms" : "Vui lòng đồng ý với điều khoản rạp");
      return;
    }
    try {
      setLoadingDev(true);
      const seatIdArr = seatIds.split(",").filter(Boolean);

      const res = await fetch("/api/checkout/start-vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seatIds: seatIdArr,
          total,
          ticketType,
          paymentMethod: "dev-auto",
          customer: {
            name: customerName || "Khách DEV",
            email: customerEmail || "dev@example.com",
          },
        }),
      });

      if (!res.ok) throw new Error("API error: " + res.status);

      const data = (await res.json()) as CheckoutStartResponse;

      if (data.ok && (data.devAutoPaid || data.booking?.status === "paid")) {
        alert(lang === "en" ? "✅ Payment Successful (DEV Test)!" : "✅ Thanh toán DEV thành công!");
        router.replace("/user/tickets");
      } else {
        const msg = "error" in data && data.error ? data.error : "Error processing payment";
        alert(msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      alert(msg);
    } finally {
      setLoadingDev(false);
    }
  }

  /** Thanh toán thật qua VNPAY */
  async function handleVnpayPay(): Promise<void> {
    if (!showtimeId || !seatIds || total <= 0) {
      alert(lang === "en" ? "Missing booking data" : "Thiếu dữ liệu thanh toán");
      return;
    }
    if (!agreeTerms) {
      alert(lang === "en" ? "Please agree to the cinema terms" : "Vui lòng đồng ý với điều khoản rạp");
      return;
    }
    try {
      setLoadingVnpay(true);
      const seatIdArr = seatIds.split(",").filter(Boolean);

      const res = await fetch("/api/checkout/start-vnpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seatIds: seatIdArr,
          total,
          ticketType,
          customer: {
            name: customerName || "User",
            email: customerEmail || "user@example.com",
          },
        }),
      });

      if (!res.ok) throw new Error("API error: " + res.status);

      const data = (await res.json()) as CheckoutStartResponse;

      if ("payUrl" in data && data.payUrl) {
        window.location.href = data.payUrl;
      } else {
        alert("error" in data && data.error ? data.error : "Cannot create payment URL");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "VNPAY error";
      alert(msg);
    } finally {
      setLoadingVnpay(false);
    }
  }

  const handleCheckout = () => {
    if (selectedMethod === "dev") {
      handleDevPay();
    } else {
      handleVnpayPay();
    }
  };

  const isProcessing = loadingDev || loadingVnpay;

  return (
    <div className="min-h-screen w-full bg-[#121414] text-[#e2e2e2] py-8 px-4 sm:px-6 lg:px-8">
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8">
        {/* Left Side: Payment Flow */}
        <section className="rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
          <div>
            {/* Top Bar / Timer */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2c2c2c] mb-6">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-white/70 hover:text-[#ff2424] transition-colors"
              >
                <ArrowLeft size={16} />
                <span>{lang === "en" ? "Back to Seats" : "Quay lại chọn ghế"}</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-semibold text-white/70 bg-[#121414] border border-[#2c2c2c] px-3 py-1.5 rounded">
                <Clock size={14} className="text-[#ff2424]" />
                <span>{lang === "en" ? "Reserved for:" : "Giữ vé trong:"}</span>
                <span className="font-mono text-[#ff2424] font-bold text-sm">{formatTimer(timeLeft)}</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-6">
              {lang === "en" ? "Payment method" : "Phương thức thanh toán"}
            </h1>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              <button
                type="button"
                onClick={() => setSelectedMethod("vnpay")}
                className={cn(
                  "p-4 rounded border flex items-center justify-between text-left transition-all",
                  selectedMethod === "vnpay"
                    ? "border-[#ff2424] bg-[#ff2424]/10 shadow-[0_0_15px_rgba(255,36,36,0.2)]"
                    : "border-[#2c2c2c] bg-[#121414] text-white/75 hover:border-white/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded", selectedMethod === "vnpay" ? "bg-[#ff2424] text-white" : "bg-[#2c2c2c] text-white/80")}>
                    <QrCode size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">VNPAY QR / Banking</div>
                    <div className="text-[11px] text-white/50">{lang === "en" ? "ATM, QR, Credit cards" : "ATM, QR Pay, Thẻ quốc tế"}</div>
                  </div>
                </div>
                {selectedMethod === "vnpay" && <Check size={18} className="text-[#ff2424]" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("dev")}
                className={cn(
                  "p-4 rounded border flex items-center justify-between text-left transition-all",
                  selectedMethod === "dev"
                    ? "border-[#ff2424] bg-[#ff2424]/10 shadow-[0_0_15px_rgba(255,36,36,0.2)]"
                    : "border-[#2c2c2c] bg-[#121414] text-white/75 hover:border-white/30"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded", selectedMethod === "dev" ? "bg-[#ff2424] text-white" : "bg-[#2c2c2c] text-white/80")}>
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">DEV Auto Test</div>
                    <div className="text-[11px] text-white/50">{lang === "en" ? "Instant test payment" : "Thanh toán thử nghiệm"}</div>
                  </div>
                </div>
                {selectedMethod === "dev" && <Check size={18} className="text-[#ff2424]" />}
              </button>
            </div>

            {/* Customer Information Form */}
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <span className="w-1.5 h-3.5 bg-[#ff2424] rounded-sm" />
                {lang === "en" ? "Customer Information" : "Thông tin khách hàng"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    {lang === "en" ? "Full Name" : "Họ và tên"}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nguyen Van A"
                    className="w-full bg-[#121414] border border-[#2c2c2c] rounded p-3 text-sm text-white focus:outline-none focus:border-[#ff2424] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-white/60 mb-1.5 font-medium">
                    {lang === "en" ? "Email to receive tickets" : "Email nhận vé điện tử"}
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-[#121414] border border-[#2c2c2c] rounded p-3 text-sm text-white focus:outline-none focus:border-[#ff2424] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer p-4 rounded bg-[#121414] border border-[#2c2c2c] hover:border-white/20 transition-colors">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#2c2c2c] bg-transparent text-[#ff2424] focus:ring-[#ff2424] cursor-pointer"
              />
              <span className="text-xs text-white/70 leading-relaxed">
                {lang === "en"
                  ? "I agree to the Multiplex cinema network rules and understand that tickets once purchased are non-refundable."
                  : "Tôi đồng ý với quy định của hệ thống rạp Multiplex và hiểu rằng vé xem phim sau khi mua sẽ không thể hoàn huỷ."}
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-[#2c2c2c] flex items-center justify-between text-xs text-white/50 mt-6">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>SSL 256-bit Secure Checkout</span>
            </div>
            <span>Multiplex Cinema Payment</span>
          </div>
        </section>

        {/* Right Side: Booking Summary */}
        <section className="rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#ff2424] mb-2 block">
              {lang === "en" ? "ORDER SUMMARY" : "TỔNG KẾT ĐẶT VÉ"}
            </span>

            <h2 className="text-2xl font-black text-white leading-tight mb-2">
              {(lang === "en" ? (movieData?.titleEn || movieTitle) : (movieData?.title || movieTitle)) || movieTitle}
            </h2>

            <div className="flex gap-2 mb-6">
              <span className="border border-[#2c2c2c] bg-[#121414] text-white px-2 py-0.5 rounded text-[11px] uppercase font-semibold">
                IMAX 3D
              </span>
              <span className="border border-[#2c2c2c] bg-[#121414] text-[#ff2424] px-2 py-0.5 rounded text-[11px] uppercase font-semibold">
                {ticketType.toUpperCase()}
              </span>
            </div>

            {/* Show info */}
            <div className="p-4 rounded bg-[#121414] border border-[#2c2c2c] space-y-2 mb-6 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50 uppercase tracking-wider">{lang === "en" ? "Showtime:" : "Suất chiếu:"}</span>
                <span className="font-bold text-white">{time} · {date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 uppercase tracking-wider">{lang === "en" ? "Selected Seats:" : "Ghế đã chọn:"}</span>
                <span className="font-bold text-[#ff2424] font-mono">{seats || (lang === "en" ? "None" : "Chưa chọn")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 uppercase tracking-wider">{lang === "en" ? "Showtime ID:" : "Mã suất chiếu:"}</span>
                <span className="font-mono text-white/80 text-[11px]">{showtimeId}</span>
              </div>
            </div>

            {/* Starring / Cast Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  {movieData?.isAnimation || movieData?.cast?.some((c) => c.isVoice)
                    ? (lang === "en" ? "Voice Cast:" : "Lồng tiếng:")
                    : (lang === "en" ? "Starring:" : "Diễn viên:")}
                </span>
                <span className="w-8 h-[2px] bg-[#ff2424]" />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {movieData?.cast && movieData.cast.length > 0 ? (
                  movieData.cast.slice(0, 4).map((actor) => (
                    <div
                      key={actor.id}
                      className="group relative aspect-[3/4] rounded-lg overflow-hidden border border-[#2c2c2c] bg-[#121414] shadow-md hover:border-[#ff2424]/60 transition-all flex flex-col justify-end p-1.5"
                    >
                      {actor.profileUrl ? (
                        <Image
                          src={actor.profileUrl}
                          alt={actor.name}
                          fill
                          sizes="(max-width: 768px) 25vw, 120px"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#1a1a1a] flex items-center justify-center text-white/30 font-bold text-base">
                          {actor.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                      <div className="relative z-10 text-center">
                        <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight line-clamp-1 drop-shadow">
                          {actor.name}
                        </p>
                        {actor.character && (
                          <p className="text-[9px] text-[#ff2424] line-clamp-1 font-medium mt-0.5" title={actor.character}>
                            {actor.character}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] rounded-lg border border-[#2c2c2c] bg-[#121414] animate-pulse flex items-center justify-center"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Film description */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-[#ff2424] rounded-sm" />
                {lang === "en" ? "Film description:" : "Nội dung phim:"}
              </h4>
              <p className="text-xs text-white/70 leading-relaxed line-clamp-4 bg-[#121414] p-3 rounded border border-[#2c2c2c]">
                {movieData?.overview || (lang === "en" ? "No description available." : "Nội dung phim đang được cập nhật.")}
              </p>
            </div>
          </div>

          <div>
            {/* Total */}
            <div className="pt-4 border-t border-[#2c2c2c] flex items-center justify-between mb-6">
              <span className="text-sm uppercase font-bold text-white/70 tracking-wider">
                {lang === "en" ? "Total Price:" : "Tổng thanh toán:"}
              </span>
              <span className="text-2xl font-black text-[#ff2424]">
                {total.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {/* CTA Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !agreeTerms || total <= 0}
              className="w-full py-4 rounded bg-[#ff2424] hover:bg-[#e01e1e] text-white font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,36,36,0.4)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Ticket size={18} />
              <span>
                {isProcessing
                  ? (lang === "en" ? "Processing..." : "Đang xử lý...")
                  : (lang === "en" ? `Buy ${seatList.length} Tickets` : `Thanh toán ${seatList.length} vé`)}
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

