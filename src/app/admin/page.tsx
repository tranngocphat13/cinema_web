"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  DollarSign,
  Ticket,
  Film,
  Building,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";

interface DailyRevenue {
  date: string;
  fullDate: string;
  revenue: number;
  tickets: number;
}

interface TopMovie {
  _id: string;
  title: string;
  posterUrl: string;
  ticketsSold: number;
  revenue: number;
  ratingLabel?: string;
}

interface RecentBooking {
  _id: string;
  ticketCode?: string;
  total: number;
  status: "pending" | "paid" | "used" | "canceled";
  isUsed?: boolean;
  paymentMethod?: string;
  customer?: { name?: string; email?: string; phone?: string };
  showtime?: {
    startTime: string;
    movie?: { title?: string; posterUrl?: string };
    cinema?: { name?: string };
    room?: { name?: string };
  };
  seats?: { number: string; type: string }[];
  createdAt: string;
}

interface AdminStats {
  totalRevenue: number;
  totalTickets: number;
  totalOrders: number;
  revenueToday: number;
  ticketsToday: number;
  revenueMonth: number;
  totalMovies: number;
  nowPlayingMovies: number;
  upcomingMovies: number;
  totalCinemas: number;
  totalRooms: number;
  dailyRevenue: DailyRevenue[];
  topMovies: TopMovie[];
  recentBookings: RecentBooking[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/stats", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching admin stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatVND = (amount: number) => {
    return `${(amount || 0).toLocaleString("vi-VN")} đ`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm font-medium">Đang tổng hợp dữ liệu thống kê...</p>
      </div>
    );
  }

  const maxDailyRevenue = Math.max(...(stats?.dailyRevenue.map((d) => d.revenue) || [1]), 1);

  return (
    <div className="space-y-8 pb-12 text-gray-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-red-600 font-bold">
            QUẢN TRỊ VIÊN
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5 flex items-center gap-2.5">
            <span>Bảng Điều Khiển & Thống Kê</span>
          </h1>
        </div>

        <button
          onClick={fetchStats}
          disabled={refreshing}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all self-start sm:self-auto active:scale-95 disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin text-red-600" : ""} />
          <span>{refreshing ? "Đang tải..." : "Làm mới dữ liệu"}</span>
        </button>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Doanh thu */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Tổng Doanh Thu
            </span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              {formatVND(stats?.totalRevenue || 0)}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-600">
              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Hôm nay: {formatVND(stats?.revenueToday || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Tổng vé */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Vé Đã Bán
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Ticket size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              {(stats?.totalTickets || 0).toLocaleString()} <span className="text-sm font-normal text-gray-500">vé</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-600">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                Hôm nay: {(stats?.ticketsToday || 0).toLocaleString()} vé
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Phim */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Phim Hệ Thống
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Film size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              {stats?.totalMovies || 0} <span className="text-sm font-normal text-gray-500">phim</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                {stats?.nowPlayingMovies || 0} đang chiếu
              </span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                {stats?.upcomingMovies || 0} sắp chiếu
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Rạp & Phòng */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Rạp & Phòng Chiếu
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building size={20} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-gray-900">
              {stats?.totalCinemas || 0} <span className="text-sm font-normal text-gray-500">cụm rạp</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-medium text-purple-700">
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-200">
                {stats?.totalRooms || 0} phòng chiếu hoạt động
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section: 7-Day Revenue Visualization */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-red-600" />
              <span>Biểu Đồ Doanh Thu 7 Ngày Gần Nhất</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Thống kê doanh số vé đã thanh toán thành công theo từng ngày
            </p>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
            Tháng này: {formatVND(stats?.revenueMonth || 0)}
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-8 pb-2 px-2 border-b border-gray-200">
          {(stats?.dailyRevenue || []).map((day) => {
            const heightPercent = Math.max(8, Math.round((day.revenue / maxDailyRevenue) * 100));

            return (
              <div key={day.fullDate} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Tooltip on Hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-20">
                  <p>{formatVND(day.revenue)}</p>
                  <p className="text-gray-300 font-normal">{day.tickets} vé</p>
                </div>

                {/* Bar */}
                <div
                  className="w-full max-w-[48px] bg-gradient-to-t from-red-600 to-red-400 group-hover:from-red-700 group-hover:to-red-500 rounded-t-lg transition-all shadow-sm"
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Date Label */}
                <span className="text-[11px] font-semibold text-gray-600 group-hover:text-red-600 transition-colors">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Top Movies & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Top 5 Best Selling Movies */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles size={18} className="text-red-600" />
                <span>Top Phim Bán Chạy Nhất</span>
              </h2>
              <Link
                href="/admin/movies"
                className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
              >
                Quản lý phim <ArrowUpRight size={14} />
              </Link>
            </div>

            {(!stats?.topMovies || stats.topMovies.length === 0) ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Chưa có dữ liệu phim bán vé.
              </div>
            ) : (
              <div className="space-y-4">
                {stats.topMovies.map((movie, idx) => {
                  const maxMovieRevenue = stats.topMovies[0]?.revenue || 1;
                  const percent = Math.round((movie.revenue / maxMovieRevenue) * 100);

                  return (
                    <div key={movie._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? "bg-amber-100 text-amber-800" : idx === 1 ? "bg-gray-200 text-gray-700" : idx === 2 ? "bg-orange-100 text-orange-800" : "bg-gray-100 text-gray-500"
                      }`}>
                        {idx + 1}
                      </span>

                      <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {movie.posterUrl ? (
                          <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" sizes="40px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">
                            No Pic
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {movie.title}
                          </p>
                          <span className="text-xs font-bold text-red-600 shrink-0">
                            {formatVND(movie.revenue)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>{movie.ticketsSold.toLocaleString()} vé đã bán</span>
                          <span>{percent}%</span>
                        </div>

                        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-red-600 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-red-600" />
                <span>Giao Dịch Đặt Vé Gần Đây</span>
              </h2>
              <Link
                href="/admin/tickets"
                className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1"
              >
                Xem tất cả vé <ArrowUpRight size={14} />
              </Link>
            </div>

            {(!stats?.recentBookings || stats.recentBookings.length === 0) ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                Chưa có đơn đặt vé nào gần đây.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.recentBookings.map((b) => {
                  const isPaid = b.status === "paid" || b.status === "used";
                  const isUsed = b.isUsed || b.status === "used";

                  return (
                    <div key={b._id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {b.showtime?.movie?.title || "Phim chiếu rạp"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          {b.customer?.name || b.customer?.email || "Khách vãng lai"} • {b.seats?.map((s) => s.number).join(", ") || "Ghế"}
                        </p>
                        <span className="text-[10px] text-gray-400">
                          {formatDate(b.createdAt)}
                        </span>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-gray-900">
                          {formatVND(b.total)}
                        </span>
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Đã vào phòng
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={10} /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Chờ xử lý
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
