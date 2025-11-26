"use client";

import React, { useMemo } from "react";

type SeatType = "normal" | "vip" | "couple";

export type SeatApi = {
  _id: string;
  number: string;
  type: SeatType;
  isAvailable: boolean;
};

function cx(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function parseSeatNumber(seatNumber: string) {
  // hỗ trợ A1, A01, AA10...
  const rowMatch = seatNumber.match(/^[A-Za-z]+/);
  const numMatch = seatNumber.match(/\d+/);
  const row = rowMatch?.[0]?.toUpperCase() ?? "?";
  const col = numMatch ? parseInt(numMatch[0], 10) : NaN;
  return { row, col: Number.isFinite(col) ? col : 0 };
}

function Screen() {
  return (
    <div className="relative mb-5">
      <div className="mx-auto w-[min(560px,92%)] h-10 rounded-b-[999px] rounded-t-2xl bg-white/10 border border-white/15" />
      <div className="mx-auto -mt-7 w-[min(560px,92%)] text-center text-xs tracking-[0.28em] text-white/60">
        SCREEN
      </div>
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-24 bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent)] opacity-70" />
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-sm text-white/85">
      <LegendItem className="bg-white text-black" label="Normal" />
      <LegendItem className="bg-yellow-400 text-black" label="VIP" />
      <LegendItem className="bg-pink-500 text-white" label="Couple" />
      <LegendItem className="bg-emerald-500 text-white" label="Selected" />
      <LegendItem className="bg-gray-600 text-white" label="Unavailable" />
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cx("h-4 w-4 rounded-md", className)} />
      <span className="text-white/80">{label}</span>
    </div>
  );
}

export default function CinemaSeatPicker({
  seats,
  selectedSeatIds,
  onChangeSelectedIds,
  ticketPrices,
  maxSelected = 8,
}: {
  seats: SeatApi[];
  selectedSeatIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  ticketPrices: Record<SeatType, number>;
  maxSelected?: number;
}) {
  const normalized = useMemo(() => {
    const mapped = seats.map((s) => {
      const { row, col } = parseSeatNumber(s.number);
      return { ...s, row, col };
    });

    const rows = Array.from(new Set(mapped.map((s) => s.row))).sort((a, b) => a.localeCompare(b));
    const maxCol = Math.max(0, ...mapped.map((s) => s.col || 0));

    const byRow = new Map<string, typeof mapped>();
    for (const r of rows) byRow.set(r, mapped.filter((x) => x.row === r).sort((a, b) => a.col - b.col));

    return { rows, maxCol, byRow, mapped };
  }, [seats]);

  const total = useMemo(() => {
    return selectedSeatIds.reduce((sum, seatId) => {
      const seat = seats.find((s) => s._id === seatId);
      return seat ? sum + ticketPrices[seat.type] : sum;
    }, 0);
  }, [selectedSeatIds, seats, ticketPrices]);

  const toggle = (seatId: string) => {
    const seat = seats.find((s) => s._id === seatId);
    if (!seat) return;

    const isSelected = selectedSeatIds.includes(seatId);
    if (isSelected) {
      onChangeSelectedIds(selectedSeatIds.filter((id) => id !== seatId));
      return;
    }

    // chỉ allow chọn ghế available
    if (!seat.isAvailable) return;

    // limit chọn
    if (selectedSeatIds.length >= maxSelected) return;

    onChangeSelectedIds([...selectedSeatIds, seatId]);
  };

  const seatClass = (s: SeatApi) => {
    const selected = selectedSeatIds.includes(s._id);
    if (selected) return "bg-emerald-500 text-white ring-2 ring-emerald-200/60";
    if (!s.isAvailable) return "bg-gray-600 text-white/90 cursor-not-allowed";
    if (s.type === "vip") return "bg-yellow-400 text-black hover:brightness-95";
    if (s.type === "couple") return "bg-pink-500 text-white hover:brightness-110";
    return "bg-white text-black hover:bg-gray-100";
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6 backdrop-blur">
      <Screen />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <Legend />
        <div className="md:text-right">
          <div className="text-xs text-white/60">Selected</div>
          <div className="text-white font-semibold">
            {selectedSeatIds.length} / {maxSelected}
          </div>
          <div className="text-xs text-white/60 mt-1">Total</div>
          <div className="text-lg font-bold text-white">{total.toLocaleString("vi-VN")}đ</div>
        </div>
      </div>

      <div className="space-y-3">
        {normalized.rows.map((row) => {
          const rowSeats = normalized.byRow.get(row) || [];
          const byCol = new Map<number, SeatApi>();
          for (const s of rowSeats) byCol.set(parseSeatNumber(s.number).col, s);

          return (
            <div key={row} className="flex items-center justify-center gap-3">
              <span className="w-6 text-center font-bold text-gray-300">{row}</span>

              <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${normalized.maxCol}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: normalized.maxCol }, (_, i) => {
                  const col = i + 1;
                  const seat = byCol.get(col);
                  if (!seat) return <div key={`${row}-${col}`} className="w-12 h-12" />;

                  const disabled = !seat.isAvailable && !selectedSeatIds.includes(seat._id);
                  return (
                    <button
                      key={seat._id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(seat._id)}
                      className={cx(
                        "w-12 h-12 rounded-md font-semibold transition active:scale-[0.98]",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300",
                        seatClass(seat)
                      )}
                      title={`${seat.number} • ${seat.type.toUpperCase()} • ${ticketPrices[seat.type].toLocaleString("vi-VN")}đ`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              <span className="w-6 text-center font-bold text-gray-300">{row}</span>
            </div>
          );
        })}
      </div>

      {/* chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        {selectedSeatIds.length === 0 ? (
          <span className="text-sm text-white/55">Chọn ghế để tiếp tục…</span>
        ) : (
          selectedSeatIds
            .map((id) => seats.find((s) => s._id === id))
            .filter(Boolean)
            .map((s) => (
              <span
                key={(s as SeatApi)._id}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 border border-emerald-400/25 px-3 py-1 text-sm text-emerald-100"
              >
                <span className="font-semibold">{(s as SeatApi).number}</span>
                <span className="text-emerald-200/80">•</span>
                <span className="text-emerald-200/90">
                  {ticketPrices[(s as SeatApi).type].toLocaleString("vi-VN")}đ
                </span>
              </span>
            ))
        )}
      </div>
    </div>
  );
}
