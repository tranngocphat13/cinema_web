"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        if (data.tickets) setTickets(data.tickets);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const now = new Date();
  const upcoming = tickets.filter((t) => new Date(t.showtime.startTime) >= now);
  const history = tickets.filter((t) => new Date(t.showtime.startTime) < now);

  const handleDownload = (ticket: Ticket) => {
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

  const renderTickets = (list: Ticket[]) => {
    if (list.length === 0) {
      return <p className="text-center text-gray-400 mt-10">Không có vé nào</p>;
    }

    return (
      <div className="flex flex-wrap justify-center gap-6 mt-6">
        {list.map((t) => (
          <div
            key={t._id}
            onClick={() => router.push(`/user/tickets/${t._id}`)}
            className="bg-black/50 border border-gray-700 rounded-2xl p-6 w-[300px] h-[380px] 
                       text-white flex flex-col justify-between cursor-pointer 
                       hover:scale-105 hover:shadow-lg hover:border-green-500 transition"
          >
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Date</span>
                <span>{new Date(t.showtime.startTime).toDateString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Movie</span>
                <span className="font-bold">{t.showtime.movie?.title}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Ticket ({t.seats.length})</span>
                <span>{t.seats.map((s) => s.number).join(", ")}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Hours</span>
                <span>
                  {new Date(t.showtime.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation(); // tránh trigger router.push
                handleDownload(t);
              }}
              className="mt-6 w-full bg-green-500 hover:bg-green-600 text-black font-semibold py-2 rounded-lg transition"
            >
              Download Ticket
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-green-900/70 to-black px-6 py-10">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-2 rounded-full ${
            activeTab === "upcoming" ? "bg-green-500 text-black" : "bg-gray-700 text-white"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-2 rounded-full ${
            activeTab === "history" ? "bg-green-500 text-black" : "bg-gray-700 text-white"
          }`}
        >
          History
        </button>
      </div>

      {activeTab === "upcoming" ? renderTickets(upcoming) : renderTickets(history)}
    </div>
  );
}
