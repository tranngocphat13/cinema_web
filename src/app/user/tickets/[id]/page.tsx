"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import TicketDetailCard from "@/components/forms/TicketCardDetails";
import { ArrowLeft } from "lucide-react";

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
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error loading ticket");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12 text-[#e2e2e2]">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/user/tickets")}
          className="mb-8 inline-flex items-center gap-2 rounded px-4 py-2 border border-[#2c2c2c] bg-[#1a1a1a] text-xs uppercase font-bold tracking-wider hover:border-[#ff2424] hover:text-[#ff2424] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to My Tickets</span>
        </button>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {err && <div className="text-red-400 text-sm font-semibold mb-6 text-center">{err}</div>}

        {!loading && !err && !ticket && (
          <div className="text-white/50 text-center py-16">Ticket not found.</div>
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

