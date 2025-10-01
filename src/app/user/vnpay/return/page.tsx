"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

type VnpReturnResponse = {
  message: string;
  bookingId?: string;
  amount?: number;
};

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      try {
        const query = searchParams.toString();
        if (!query) return;

        const res = await fetch(`/api/vnpay/return?${query}`);
        const data: VnpReturnResponse = await res.json();

        if (res.ok && data.message?.toLowerCase().includes("thành công")) {
          setSuccess(true);
          if (data.bookingId) setBookingId(data.bookingId);
        } else {
          setErrorMsg(data.message || "Thanh toán thất bại");
        }
      } catch (err) {
        setErrorMsg(
          err instanceof Error ? err.message : "Có lỗi khi xác minh thanh toán"
        );
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-green-900 to-black text-white">
        <p className="text-xl">Đang kiểm tra kết quả...</p>
      </main>
    );
  }

  if (!success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-red-900 to-black text-white space-y-6">
        <h1 className="text-2xl font-bold">Thanh toán thất bại</h1>
        <p className="text-lg text-gray-300">{errorMsg}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-md border border-gray-400 px-6 py-2 hover:bg-gray-700 transition"
        >
          Quay về trang chủ
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-green-950 to-black text-white px-6">
      <h1 className="text-2xl font-bold mb-6">Payment Success</h1>
      <CheckCircle className="w-24 h-24 text-green-400 mb-8" />
      <div className="flex flex-col space-y-4">
        <button
          onClick={() =>
            router.push(bookingId ? `/user/tickets/${bookingId}` : "/user/tickets")
          }
          className="w-48 bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition"
        >
          View Ticket
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-48 border border-gray-400 hover:bg-gray-700 font-semibold py-3 rounded-lg transition"
        >
          Back to Homepage
        </button>
      </div>
    </main>
  );
}
