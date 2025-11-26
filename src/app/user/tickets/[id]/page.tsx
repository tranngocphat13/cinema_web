"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TicketDetailCard from "@/components/forms/TicketCardDetails";

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

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`/api/tickets/${id}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Load ticket failed");

        if (!cancelled) setTicket(data?.ticket || null);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Lỗi không xác định");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen px-6 py-12 text-white
                    bg-[radial-gradient(1200px_500px_at_50%_20%,rgba(16,185,129,0.20),transparent_60%),linear-gradient(to_bottom,#050a07,#030504,#000)]">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push("/user/tickets")}
          className="mb-10 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2
                     hover:bg-white/10 transition"
        >
          ← Back
        </button>

        {loading && <div className="text-gray-300">Loading...</div>}
        {err && <div className="text-red-400">{err}</div>}

        {!loading && !err && !ticket && (
          <div className="text-gray-300">Ticket not found.</div>
        )}

        {!loading && !err && ticket && (
          <div className="flex justify-center">
            <TicketDetailCard ticket={ticket} />
          </div>
        )}
      </div>
    </div>
  );
}
