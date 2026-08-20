"use client";

import { useEffect, useState } from "react";
import TicketCard from "@/components/forms/TicketCard";
import { Ticket as TicketIcon } from "lucide-react";
import { useI18n } from "@/components/i18n/i18nProvider";

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
  const { t, lang } = useI18n();
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
        if (!cancelled) setErr(e instanceof Error ? e.message : "Error loading tickets");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-12 text-[#e2e2e2]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 pb-4 border-b border-[#2c2c2c] flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ff2424] font-bold">
              {lang === "en" ? "MY ACCOUNT" : "TÀI KHOẢN"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5 flex items-center gap-2.5">
              <TicketIcon className="text-[#ff2424]" size={28} />
              {t("nav.myTickets")}
            </h1>
          </div>
          <span className="text-xs text-white/50 uppercase tracking-wider">
            {tickets.length} {lang === "en" ? "Tickets" : "Vé"}
          </span>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#ff2424] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {err && <div className="text-red-400 text-sm font-semibold mb-6">{err}</div>}

        {!loading && !err && tickets.length === 0 && (
          <div className="p-12 text-center rounded-xl border border-[#2c2c2c] bg-[#1a1a1a]">
            <TicketIcon size={40} className="mx-auto text-white/20 mb-3" />
            <p className="text-white/60 text-sm">
              {lang === "en" ? "You don’t have any tickets yet." : "Bạn chưa có vé xem phim nào."}
            </p>
          </div>
        )}

        {!loading && !err && tickets.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((t) => (
              <TicketCard key={t._id} ticket={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

