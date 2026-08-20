"use client";

import Link from "next/link";
import jsPDF from "jspdf";
import { Ticket as TicketIcon, Download } from "lucide-react";

type Ticket = {
  _id: string;
  total?: number;
  seats?: { number: string }[];
  showtime?: {
    startTime?: string;
    movie?: { title?: string };
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

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const title = (ticket.showtime?.movie?.title || "—").toUpperCase();
  const dateText = formatDateEN(ticket.showtime?.startTime);
  const timeText = formatTimeHHmm(ticket.showtime?.startTime);

  const seatList = (ticket.seats || []).map((s) => s.number).filter(Boolean);
  const seatText = seatList.length ? seatList.join(", ") : "—";

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("MULTIPLEX CINEMA TICKET", 20, 18);
    doc.setFontSize(12);
    doc.text(`ID: ${ticket._id}`, 20, 32);
    doc.text(`Date: ${dateText}`, 20, 44);
    doc.text(`Time: ${timeText}`, 20, 54);
    doc.text(`Movie: ${ticket.showtime?.movie?.title || "—"}`, 20, 64);
    doc.text(`Seats: ${seatText}`, 20, 74);
    doc.save(`multiplex-ticket-${ticket._id}.pdf`);
  };

  return (
    <Link
      href={`/user/tickets/${ticket._id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2424] rounded-xl group"
    >
      <div
        className="relative w-full rounded-xl border border-[#2c2c2c] bg-[#1a1a1a] p-6 backdrop-blur-md
                   shadow-xl group-hover:border-[#ff2424] group-hover:shadow-[0_0_25px_rgba(255,36,36,0.2)] transition-all duration-300"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#2c2c2c] mb-4">
          <div className="flex items-center gap-2">
            <TicketIcon size={16} className="text-[#ff2424]" />
            <span className="text-xs uppercase font-bold tracking-wider text-white">MULTIPLEX TICKET</span>
          </div>
          <span className="text-[11px] font-mono text-white/50">{ticket._id.slice(-6).toUpperCase()}</span>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-white/50">Movie Title</div>
          <div className="text-white text-lg font-black tracking-tight mt-1 line-clamp-1 group-hover:text-[#ff2424] transition-colors">
            {title}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-white/50 uppercase tracking-wider">Date:</span>
              <p className="text-white font-bold mt-0.5">{dateText}</p>
            </div>
            <div className="text-right">
              <span className="text-white/50 uppercase tracking-wider">Time:</span>
              <p className="text-white font-bold mt-0.5 font-mono">{timeText}</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2c2c2c] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-white/50 uppercase">Seats ({seatList.length}):</span>
              <p className="text-sm font-black text-[#ff2424]">{seatText}</p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                handleDownload();
              }}
              className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 bg-[#121414] hover:bg-[#ff2424] hover:text-white border border-[#2c2c2c] text-xs font-semibold transition-colors"
            >
              <Download size={13} />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
