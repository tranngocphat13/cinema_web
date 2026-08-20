"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  Ticket,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Eye,
  RefreshCw,
  X,
  Calendar,
  Building,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface TicketItem {
  _id: string;
  ticketCode?: string;
  total: number;
  status: "pending" | "paid" | "used" | "canceled";
  isUsed?: boolean;
  checkInAt?: string;
  paymentMethod?: string;
  customer?: { name?: string; email?: string; phone?: string };
  showtime?: {
    startTime: string;
    movie?: { title?: string; posterUrl?: string; runtime?: number };
    cinema?: { name?: string; address?: string };
    room?: { name?: string };
  };
  seats?: { number: string; type: string }[];
  createdAt: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "used" | "canceled">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q: search.trim(),
        status: statusFilter,
        page: String(page),
        limit: "12",
      });

      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, statusFilter, page]);

  const handleCheckIn = async (ticketId: string, action: "check_in" | "undo_check_in") => {
    setActionLoading(true);
    setToastMessage(null);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();

      if (res.ok) {
        setToastMessage({ type: "success", text: data.message });
        // Update local state
        setTickets((prev) =>
          prev.map((t) => {
            if (t._id === ticketId) {
              return {
                ...t,
                isUsed: action === "check_in",
                status: action === "check_in" ? "used" : "paid",
                checkInAt: action === "check_in" ? new Date().toISOString() : undefined,
              };
            }
            return t;
          })
        );
        if (selectedTicket && selectedTicket._id === ticketId) {
          setSelectedTicket((prev) =>
            prev
              ? {
                  ...prev,
                  isUsed: action === "check_in",
                  status: action === "check_in" ? "used" : "paid",
                  checkInAt: action === "check_in" ? new Date().toISOString() : undefined,
                }
              : null
          );
        }
      } else {
        setToastMessage({ type: "error", text: data.error || "Thất bại" });
      }
    } catch {
      setToastMessage({ type: "error", text: "Lỗi kết nối máy chủ" });
    } finally {
      setActionLoading(false);
    }
  };

  const formatVND = (amount: number) => `${(amount || 0).toLocaleString("vi-VN")} đ`;

  const formatDate = (dateStr?: string) => {
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

  return (
    <div className="space-y-6 pb-12 text-gray-900">
      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md animate-fade-in ${
            toastMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
              : "bg-red-50 border border-red-300 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-gray-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-red-600 font-bold">
            QUẢN LÝ VẬN HÀNH
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5 flex items-center gap-2.5">
            <Ticket className="text-red-600" size={28} />
            <span>Quản Lý Vé & Soát Vé (Check-in)</span>
          </h1>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-red-600" : ""} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo Mã vé, Tên, Email hoặc SĐT..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 focus:border-red-600 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {[
            { id: "all", label: "Tất cả" },
            { id: "paid", label: "Chưa soát vé" },
            { id: "used", label: "Đã vào phòng" },
            { id: "canceled", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id as any);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Total Count */}
      <div className="text-xs text-gray-500 font-semibold flex items-center justify-between px-1">
        <span>Tìm thấy {totalCount} vé</span>
        <span>Trang {page} / {totalPages}</span>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-gray-500 font-medium">Đang tải danh sách vé...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Ticket size={36} className="mx-auto text-gray-300 mb-2" />
            <p>Không tìm thấy vé nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Mã Vé</th>
                  <th className="py-3 px-4">Phim & Rạp</th>
                  <th className="py-3 px-4">Suất Chiếu</th>
                  <th className="py-3 px-4">Khách Hàng</th>
                  <th className="py-3 px-4">Ghế</th>
                  <th className="py-3 px-4">Tổng Tiền</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {tickets.map((t) => {
                  const isUsed = t.isUsed || t.status === "used";
                  const isPaid = t.status === "paid" || isUsed;
                  const isCanceled = t.status === "canceled";

                  return (
                    <tr key={t._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* Ticket Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        {t.ticketCode || `MPX-${t._id.slice(-6).toUpperCase()}`}
                      </td>

                      {/* Movie & Cinema */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900 line-clamp-1 max-w-[180px]">
                          {t.showtime?.movie?.title || "Phim chiếu rạp"}
                        </p>
                        <p className="text-[11px] text-gray-500 line-clamp-1 max-w-[180px]">
                          {t.showtime?.cinema?.name} • {t.showtime?.room?.name}
                        </p>
                      </td>

                      {/* Showtime */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-gray-700">
                        {formatDate(t.showtime?.startTime)}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">
                          {t.customer?.name || "Khách vãng lai"}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate max-w-[150px]">
                          {t.customer?.email || t.customer?.phone || "—"}
                        </p>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {t.seats?.map((s) => (
                            <span key={s.number} className="bg-gray-100 text-gray-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-gray-200">
                              {s.number}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-red-600 whitespace-nowrap">
                        {formatVND(t.total)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isUsed ? (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200 text-[11px]">
                            <ShieldCheck size={12} /> Đã vào phòng
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200 text-[11px]">
                            <CheckCircle2 size={12} /> Chưa soát vé
                          </span>
                        ) : isCanceled ? (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-bold px-2.5 py-1 rounded-full border border-red-200 text-[11px]">
                            <XCircle size={12} /> Đã hủy
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 font-bold px-2.5 py-1 rounded-full border border-gray-200 text-[11px]">
                            <Clock size={12} /> Chờ thanh toán
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Check-in button */}
                          {isPaid && !isUsed && (
                            <button
                              onClick={() => handleCheckIn(t._id, "check_in")}
                              disabled={actionLoading}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm active:scale-95 flex items-center gap-1"
                            >
                              <ShieldCheck size={13} />
                              <span>Soát Vé</span>
                            </button>
                          )}

                          {isUsed && (
                            <button
                              onClick={() => handleCheckIn(t._id, "undo_check_in")}
                              disabled={actionLoading}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors"
                            >
                              Hoàn tác
                            </button>
                          )}

                          {/* View details / QR modal */}
                          <button
                            onClick={() => setSelectedTicket(t)}
                            className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 p-1.5 rounded-lg text-xs transition-colors"
                            title="Xem chi tiết & QR"
                          >
                            <QrCode size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={14} /> Trước
            </button>
            <span className="font-semibold">
              Trang {page} trên {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
            >
              Sau <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Ticket Details & QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 text-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-red-600 text-white p-6 flex items-center justify-between relative">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-black opacity-80">
                  MULTIPLEX E-TICKET
                </span>
                <h3 className="text-xl font-black mt-0.5">
                  {selectedTicket.showtime?.movie?.title || "Vé Xem Phim"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code section */}
              <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <QRCodeSVG
                  value={selectedTicket._id}
                  size={140}
                  level="H"
                  includeMargin={true}
                  className="rounded-xl shadow-sm"
                />
                <p className="text-xs font-mono font-bold text-gray-700 mt-2">
                  {selectedTicket.ticketCode || `MPX-${selectedTicket._id.slice(-6).toUpperCase()}`}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Quét mã để soát vé vào phòng chiếu</p>
              </div>

              {/* Details list */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Rạp chiếu:</span>
                  <span className="font-bold text-gray-900">{selectedTicket.showtime?.cinema?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Phòng chiếu:</span>
                  <span className="font-bold text-gray-900">{selectedTicket.showtime?.room?.name}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Suất chiếu:</span>
                  <span className="font-bold text-gray-900">{formatDate(selectedTicket.showtime?.startTime)}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Danh sách ghế:</span>
                  <span className="font-bold text-red-600">{selectedTicket.seats?.map((s) => s.number).join(", ")}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Khách hàng:</span>
                  <span className="font-bold text-gray-900">{selectedTicket.customer?.name || "Khách vãng lai"} ({selectedTicket.customer?.email})</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-gray-500">Tổng thanh toán:</span>
                  <span className="font-black text-sm text-gray-900">{formatVND(selectedTicket.total)}</span>
                </div>
                {selectedTicket.checkInAt && (
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-purple-700 font-bold">
                    <span>Thời gian soát vé:</span>
                    <span>{formatDate(selectedTicket.checkInAt)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-2 flex items-center gap-3">
                {!selectedTicket.isUsed && selectedTicket.status !== "canceled" ? (
                  <button
                    onClick={() => handleCheckIn(selectedTicket._id, "check_in")}
                    disabled={actionLoading}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={18} />
                    <span>Xác Nhận Soát Vé (Vào Phòng)</span>
                  </button>
                ) : selectedTicket.isUsed ? (
                  <button
                    onClick={() => handleCheckIn(selectedTicket._id, "undo_check_in")}
                    disabled={actionLoading}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl text-sm transition-all"
                  >
                    Hoàn Tác Soát Vé
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
