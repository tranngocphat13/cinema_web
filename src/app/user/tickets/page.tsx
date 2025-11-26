"use client";

import { useEffect, useState } from "react";
import TicketCard from "@/components/forms/TicketCard";

type Ticket = {
  _id: string;
  total?: number;
  seats?: { number: string }[];
  showtime?: {
    startTime?: string;
    movie?: { title?: string };
  };
};

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("/api/tickets", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Load tickets failed");

        if (!cancelled) setTickets(Array.isArray(data?.tickets) ? data.tickets : []);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 text-white
                    bg-[radial-gradient(1200px_500px_at_50%_20%,rgba(16,185,129,0.20),transparent_60%),linear-gradient(to_bottom,#050a07,#030504,#000)]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-gray-300 mt-2">Your purchased movie tickets.</p>
        </div>

        {loading && <div className="text-gray-300">Loading...</div>}
        {err && <div className="text-red-400">{err}</div>}

        {!loading && !err && tickets.length === 0 && (
          <div className="text-gray-300">You don’t have any tickets yet.</div>
        )}

        {!loading && !err && tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((t) => (
              <TicketCard key={t._id} ticket={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
