"use client";

import jsPDF from "jspdf";

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
    doc.text("CINEMA TICKET", 20, 18);

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

    doc.save(`ticket-${ticket._id}.pdf`);
  };

  return (
    <div className="relative w-full max-w-[380px] rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-md
                    shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-60
                      [background:radial-gradient(120%_80%_at_50%_0%,rgba(16,185,129,0.25),transparent_70%)]" />

      <div className="relative">
        {/* Date */}
        <div className="text-gray-300 text-sm">Date</div>
        <div className="text-white text-xl font-semibold mt-1">{dateText}</div>

        {/* Movie title */}
        <div className="text-gray-300 text-sm mt-6">Movie Title</div>
        <div className="text-white text-base font-extrabold tracking-wide mt-1 line-clamp-2">
          {title}
        </div>

        {/* Ticket + Hours */}
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

        {/* Extra detail (vẫn cùng style) */}
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Ticket ID</span>
            <span className="text-white font-mono text-right break-all">{ticket._id}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Cinema</span>
            <span className="text-white font-semibold text-right">{cinemaName}</span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-gray-300">Room</span>
            <span className="text-white font-semibold">{roomName}</span>
          </div>

          {typeof ticket.total === "number" && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-300">Total</span>
              <span className="text-white font-bold">{ticket.total.toLocaleString()}đ</span>
            </div>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleDownload}
          className="mt-6 w-full rounded-xl bg-emerald-400 py-3 font-semibold text-black
                     hover:bg-emerald-300 active:scale-[0.99] transition"
        >
          Download Ticket
        </button>
      </div>
    </div>
  );
}
