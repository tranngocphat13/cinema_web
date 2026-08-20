"use client";

import jsPDF from "jspdf";
import { Ticket as TicketIcon, Download } from "lucide-react";

type Ticket = {
  _id: string;
  total?: number;
  status?: string;
  createdAt?: string;

  seats?: { number: string }[];

  showtime?: {
    startTime?: string;
    movie?: { title?: string };
    cinema?: { name?: string; address?: string };
    room?: { name?: string };
  };
};

function formatDateEN(iso?: string) {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatTimeHHmm(iso?: string) {
  const d = iso ? new Date(iso) : null;
  if (!d || isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function TicketDetailCard({ ticket }: { ticket: Ticket }) {
  const title = (ticket.showtime?.movie?.title || "—").toUpperCase();
  const dateText = formatDateEN(ticket.showtime?.startTime);
  const timeText = formatTimeHHmm(ticket.showtime?.startTime);

  const seatList = (ticket.seats || []).map((s) => s.number).filter(Boolean);
  const seatText = seatList.length ? seatList.join(", ") : "—";

  const cinemaName = ticket.showtime?.cinema?.name || "—";
  const roomName = ticket.showtime?.room?.name || "—";

  const handleDownload = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("MULTIPLEX CINEMA TICKET", 20, 18);

    doc.setFontSize(12);
    doc.text(`Ticket ID: ${ticket._id}`, 20, 32);
    doc.text(`Movie: ${ticket.showtime?.movie?.title || "—"}`, 20, 44);
    doc.text(`Date: ${dateText}`, 20, 54);
    doc.text(`Time: ${timeText}`, 20, 64);
    doc.text(`Cinema: ${cinemaName}`, 20, 74);
    doc.text(`Room: ${roomName}`, 20, 84);
    doc.text(`Seats: ${seatText}`, 20, 94);
    if (typeof ticket.total === "number") {
      doc.text(`Total: ${ticket.total.toLocaleString()}đ`, 20, 104);
    }

    doc.save(`multiplex-ticket-${ticket._id}.pdf`);
  };

  return (
    <div className="relative w-full max-w-[420px] rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-6 sm:p-8 backdrop-blur-md shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#2c2c2c] mb-6">
        <div className="flex items-center gap-2">
          <TicketIcon size={18} className="text-[#ff2424]" />
          <span className="text-xs uppercase font-bold tracking-widest text-white">E-TICKET DETAILS</span>
        </div>
        <span className="text-[11px] font-mono text-[#ff2424] bg-[#ff2424]/10 border border-[#ff2424]/30 px-2 py-0.5 rounded">
          {ticket.status?.toUpperCase() || "CONFIRMED"}
        </span>
      </div>

      <div className="relative space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">Movie Title</div>
          <div className="text-white text-xl font-black tracking-tight mt-1">{title}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-[#2c2c2c]/50">
          <div>
            <span className="text-white/50 uppercase tracking-wider">Date</span>
            <p className="text-white font-bold mt-0.5 text-sm">{dateText}</p>
          </div>
          <div className="text-right">
            <span className="text-white/50 uppercase tracking-wider">Time</span>
            <p className="text-white font-bold mt-0.5 text-sm font-mono">{timeText}</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs pt-3 border-t border-[#2c2c2c]/50">
          <div className="flex justify-between gap-4">
            <span className="text-white/50 uppercase tracking-wider">Ticket ID:</span>
            <span className="text-white/90 font-mono text-right break-all">{ticket._id}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50 uppercase tracking-wider">Cinema:</span>
            <span className="text-white font-bold text-right">{cinemaName}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50 uppercase tracking-wider">Room:</span>
            <span className="text-white font-semibold">{roomName}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/50 uppercase tracking-wider">Seats ({seatList.length}):</span>
            <span className="text-[#ff2424] font-black text-sm">{seatText}</span>
          </div>

          {typeof ticket.total === "number" && (
            <div className="flex justify-between gap-4 pt-3 border-t border-[#2c2c2c]">
              <span className="text-white/70 uppercase font-bold">Total:</span>
              <span className="text-white font-black text-base text-[#ff2424]">{ticket.total.toLocaleString("vi-VN")}đ</span>
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleDownload}
          className="mt-6 w-full rounded bg-[#ff2424] hover:bg-[#e01e1e] py-3 font-bold uppercase tracking-wider text-white text-xs sm:text-sm transition shadow-[0_0_15px_rgba(255,36,36,0.3)] flex items-center justify-center gap-2"
        >
          <Download size={16} />
          <span>Download PDF Ticket</span>
        </button>
      </div>
    </div>
  );
}

