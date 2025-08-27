"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import QRCode from "qrcode";

interface Seat {
  label: string;
  status: "available" | "held" | "confirmed";
}

interface Showtime {
  _id: string;
  movieTitle: string;
  posterUrl: string;
}

export default function BookingPage({ params }: { params: { showtimeId: string } }) {
  const { showtimeId } = params;

  const [showtime, setShowtime] = useState<Showtime | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [timer, setTimer] = useState<number>(0);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [bookingId, setBookingId] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy dữ liệu showtime + seats
  const fetchData = async () => {
    try {
      const resSeats = await fetch(`/api/showtimes/${showtimeId}/seats`);
      const dataSeats: Seat[] = await resSeats.json();
      setSeats(dataSeats);

      const resShowtime = await fetch(`/api/showtimes/${showtimeId}`);
      const dataShowtime: Showtime = await resShowtime.json();
      setShowtime(dataShowtime);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleSeat = (label: string, status: Seat["status"]) => {
    if (status !== "available") return;
    setSelected(prev =>
      prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
    );
  };

  const holdSeats = async () => {
    if (!selected.length) return alert("Chọn ghế trước!");
    try {
      const res = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showtimeId,
          seats: selected,
          user: { name: "Khách", email: "guest@example.com" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBookingId(data.bookingId);
        const expires = new Date(data.holdExpires).getTime();
        startTimer(expires);
        fetchData();
      } else {
        alert(data.error || "Giữ ghế thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi giữ ghế");
    }
  };

  const startTimer = (expires: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const tick = () => {
      const remain = Math.max(0, Math.floor((expires - Date.now()) / 1000));
      setTimer(remain);
      if (remain <= 0 && timerRef.current) clearInterval(timerRef.current);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const payAndConfirm = async () => {
    if (!bookingId) return alert("Bạn cần giữ ghế trước");
    try {
      const res = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (data.success) {
        const url = await QRCode.toDataURL(data.qrData);
        setQrUrl(url);
        fetchData();
        alert("Thanh toán thành công!");
      } else {
        alert(data.error || "Thanh toán thất bại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi thanh toán");
    }
  };

  if (!showtime) return <p className="text-center p-6">Đang tải...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{showtime.movieTitle}</h1>

      {showtime.posterUrl && (
        <div className="mb-4 relative w-64 h-96 mx-auto">
          <Image
            src={showtime.posterUrl}
            alt={showtime.movieTitle}
            fill
            className="object-cover rounded shadow"
          />
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Chọn Ghế</h2>
      <div className="grid grid-cols-12 gap-2 mb-4">
        {seats.map(seat => (
          <button
            key={seat.label}
            onClick={() => toggleSeat(seat.label, seat.status)}
            className={`p-2 rounded text-sm ${
              seat.status === "confirmed"
                ? "bg-gray-500 cursor-not-allowed"
                : seat.status === "held"
                ? "bg-purple-300"
                : selected.includes(seat.label)
                ? "bg-green-500 text-white"
                : "bg-blue-200 hover:bg-blue-300"
            }`}
          >
            {seat.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <button
          onClick={holdSeats}
          className="bg-yellow-500 px-4 py-2 rounded text-white mr-2 hover:bg-yellow-600"
        >
          Giữ Ghế 5 phút
        </button>
        <button
          onClick={payAndConfirm}
          className="bg-green-500 px-4 py-2 rounded text-white hover:bg-green-600"
        >
          Thanh toán
        </button>
      </div>

      {timer > 0 && (
        <div className="mb-4 font-medium">
          Thời gian giữ ghế: {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")}
        </div>
      )}

      {qrUrl && (
        <div className="mt-4 text-center">
          <p className="mb-2 font-medium">Thanh toán thành công! Mã QR vé của bạn:</p>
          <Image src={qrUrl} alt="QR Code" className="mx-auto w-48 h-48" width={400} height={400}/>
        </div>
      )}
    </div>
  );
}
