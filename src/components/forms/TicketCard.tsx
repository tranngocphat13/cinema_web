"use client";

import Link from "next/link";
import jsPDF from "jspdf";

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
    doc.text("CINEMA TICKET", 20, 18);
    doc.setFontSize(12);
    doc.text(`ID: ${ticket._id}`, 20, 32);
    doc.text(`Date: ${dateText}`, 20, 44);
    doc.text(`Time: ${timeText}`, 20, 54);
    doc.text(`Movie: ${ticket.showtime?.movie?.title || "—"}`, 20, 64);
    doc.text(`Seats: ${seatText}`, 20, 74);
    doc.save(`ticket-${ticket._id}.pdf`);
  };

  return (
    <Link
      href={`/user/tickets/${ticket._id}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl"
    >
      <div
        className="relative w-full max-w-[340px] rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md
                   shadow-[0_0_0_1px_rgba(255,255,255,0.06)]
                   hover:border-emerald-400/50 hover:bg-white/[0.07] transition"
      >
        {/* glow */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-60
                     [background:radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.25),transparent_70%)]"
        />

        <div className="relative">
          <div className="text-gray-300 text-sm">Date</div>
          <div className="text-white text-xl font-semibold mt-1">{dateText}</div>

          <div className="text-gray-300 text-sm mt-6">Movie Title</div>
          <div className="text-white text-base font-extrabold tracking-wide mt-1 line-clamp-2">
            {title}
          </div>

          <div className="mt-6 flex items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-gray-300 text-sm">
                <span>Ticket</span>
                <span className="text-white/90">({seatList.length || 0})</span>
              </div>
              <div className="text-white font-semibold mt-1">{seatText}</div>
            </div>

            <div className="text-right">
              <div className="text-gray-300 text-sm">Hours</div>
              <div className="text-white text-lg font-bold mt-1">{timeText}</div>
            </div>
          </div>

          <button
            onClick={(e) => {
              // ✅ chặn Link điều hướng khi bấm Download
              e.preventDefault();
              e.stopPropagation();
              handleDownload();
            }}
            className="mt-6 w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black
                       hover:bg-emerald-300 active:scale-[0.99] transition"
          >
            Download Ticket
          </button>
        </div>
      </div>
    </Link>
  );
}
