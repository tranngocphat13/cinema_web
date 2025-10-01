"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

type CheckoutStartResponse =
  | {
      ok: true;
      devAutoPaid?: boolean;
      booking?: { status?: "pending" | "paid" | "canceled" };
      bookingId?: string;
      message?: string;
    }
  | {
      ok?: false;
      error: string;
    };

export default function BookingDetail() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const movieTitle = searchParams.get("movieTitle") ?? "";
  const date = searchParams.get("date") ?? "";
  const time = searchParams.get("time") ?? "";
  const seats = searchParams.get("seats") ?? "";
  const seatIds = searchParams.get("seatIds") ?? "";
  const total = Number(searchParams.get("total") ?? "0");
  const showtimeId = searchParams.get("showtimeId") ?? "";

  const [loadingDev, setLoadingDev] = useState(false);
  const [loadingVnpay, setLoadingVnpay] = useState(false);

  /** Thanh toán DEV auto (demo) */
  async function handleDevPay(): Promise<void> {
    if (!showtimeId || !seatIds || !total) {
      alert("Thiếu dữ liệu thanh toán");
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
          ticketType: "normal",
          paymentMethod: "dev-auto",
          customer: {
            name: "Khách DEV",
            phone: "0900000000",
            email: "dev@example.com",
          },
        }),
      });

      const data = (await res.json()) as CheckoutStartResponse;

      if (
        "ok" in data &&
        data.ok &&
        (data.devAutoPaid || data.booking?.status === "paid")
      ) {
        alert("✅ Thanh toán DEV thành công!");
        router.replace(`/user/movies/${encodeURIComponent(movieTitle)}`);
      } else {
        const msg =
          "error" in data && data.error ? data.error : "Có lỗi khi thanh toán";
        alert(msg);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi không xác định";
      alert(msg);
    } finally {
      setLoadingDev(false);
    }
  }

  /** Thanh toán thật qua VNPAY */
  /** Thanh toán thật qua VNPAY */
  async function handleVnpayPay(): Promise<void> {
    if (!showtimeId || !seatIds || !total) {
      alert("Thiếu dữ liệu thanh toán");
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
          ticketType: "normal",
          customer: {
            name: "Người dùng",
            phone: "0900000000",
            email: "user@example.com",
          },
        }),
      });

      const data = await res.json();
      if (data.payUrl) {
        window.location.href = data.payUrl; // 🔗 chuyển qua VNPAY
      } else {
        alert(data.error || "Không tạo được URL thanh toán");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi VNPAY không xác định";
      alert(msg);
    } finally {
      setLoadingVnpay(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-green-950 to-black text-white px-6 py-12">
      <div className="w-full max-w-md bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-8">
        {/* Tiêu đề */}
        <h1 className="text-2xl font-bold text-center">Chi tiết đặt vé</h1>

        {/* Thông tin lịch chiếu */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-300">Lịch chiếu</h2>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Tên phim</span>
            <span className="font-medium break-all">{movieTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Ngày</span>
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Giờ</span>
            <span className="font-medium">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">
              Ghế ({seats.split(",").filter(Boolean).length})
            </span>
            <span className="font-medium break-all">{seats}</span>
          </div>
        </div>

        {/* Chi tiết giao dịch */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-300">
            Chi tiết giao dịch
          </h2>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Mã suất chiếu</span>
            <span className="font-mono">{showtimeId}</span>
          </div>
          <div className="border-t border-gray-700 pt-3 flex justify-between font-bold text-yellow-400">
            <span>Tổng thanh toán</span>
            <span>{total.toLocaleString()}đ</span>
          </div>
        </div>

        {/* Nút thanh toán */}
        <div className="space-y-3">
          <button
            onClick={handleDevPay}
            disabled={loadingDev}
            className="w-full bg-green-500 hover:bg-green-600 transition rounded-lg py-3 font-semibold text-black disabled:opacity-60"
          >
            {loadingDev ? "Đang xử lý..." : "Thanh toán (DEV auto)"}
          </button>

          <button
            onClick={handleVnpayPay}
            disabled={loadingVnpay}
            className="w-full bg-blue-500 hover:bg-blue-600 transition rounded-lg py-3 font-semibold text-white disabled:opacity-60"
          >
            {loadingVnpay ? "Đang chuyển tới VNPAY..." : "Thanh toán qua VNPAY"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500">
          *Vé đã mua không thể hủy
        </p>
      </div>
    </div>
  );
}
