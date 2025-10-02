"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";

type Ticket = {
  _id: string;
  showtime: {
    startTime: string;
    movie?: { title: string };
  };
  seats: { number: string }[];
  total: number;
};

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/tickets/${id}`);
        const data = await res.json();
        if (data.ticket) setTicket(data.ticket);
      } catch (e) {
        console.error(e);
      }
    };
    if (id) load();
  }, [id]);

  if (!ticket) {
    return <p className="text-center text-gray-400 mt-20">Đang tải vé...</p>;
  }

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("🎟️ CINEMA TICKET", 20, 20);
    doc.setFontSize(14);
    doc.text(`Movie: ${ticket.showtime.movie?.title}`, 20, 40);
    doc.text(`Date: ${new Date(ticket.showtime.startTime).toDateString()}`, 20, 55);
    doc.text(
      `Time: ${new Date(ticket.showtime.startTime).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      20,
      70
    );
    doc.text(`Seats: ${ticket.seats.map((s) => s.number).join(", ")}`, 20, 85);
    doc.save(`ticket-${ticket._id}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-green-900/70 to-black text-white px-6 py-12">
      <h1 className="text-2xl font-bold mb-8">Ticket Detail</h1>

      <div className="bg-black/60 backdrop-blur-md rounded-2xl p-8 shadow-lg w-[350px] h-[420px] space-y-4 border border-gray-700">
        <div className="flex justify-between">
          <span className="text-gray-400">Date</span>
          <span className="font-medium">{new Date(ticket.showtime.startTime).toDateString()}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Movie Title</span>
          <span className="font-bold">{ticket.showtime.movie?.title}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Ticket ({ticket.seats.length})</span>
          <span className="font-medium">{ticket.seats.map((s) => s.number).join(", ")}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">Hours</span>
          <span className="font-medium">
            {new Date(ticket.showtime.startTime).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <button
          onClick={handleDownload}
          className="mt-6 w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-3 rounded-lg transition"
        >
          Tải vé
        </button>
      </div>

      <button
        onClick={() => router.push("/user/tickets")}
        className="mt-8 border border-gray-400 px-6 py-3 rounded-lg hover:bg-gray-800 transition"
      >
        Quay lại vé của tôi
      </button>
    </div>
  );
}
