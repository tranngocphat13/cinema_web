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
  const rowMatch = seatNumber.match(/^[A-Za-z]+/);
  const numMatch = seatNumber.match(/\d+/);
  const row = rowMatch?.[0]?.toUpperCase() ?? "?";
  const col = numMatch ? parseInt(numMatch[0], 10) : NaN;
  return { row, col: Number.isFinite(col) ? col : 0 };
}

function Screen() {
  return (
    <div className="w-full max-w-xl mx-auto mb-10 flex flex-col items-center">
      <svg className="w-full h-auto drop-shadow-[0_10px_20px_rgba(255,255,255,0.08)]" viewBox="0 0 400 40">
        <path d="M 0 40 Q 200 0 400 40" fill="none" stroke="#e2e2e2" strokeWidth="2.5" className="opacity-80" />
        <path d="M 0 40 Q 200 0 400 40" fill="none" stroke="#ffffff" strokeWidth="4" filter="blur(4px)" className="opacity-40" />
      </svg>
      <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#e2e2e2]/60 mt-3">SCREEN</span>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-[#e2e2e2]/75">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#1e2020] border border-[#2c2c2c]" />
        <span>Normal</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#241e12] border border-[#eab308]" />
        <span>VIP</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#24131d] border border-[#ec4899]" />
        <span>Couple</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#ff2424] shadow-[0_0_8px_rgba(255,36,36,0.6)]" />
        <span className="text-white">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-[#1a1c1c] border border-[#2c2c2c] opacity-25" />
        <span className="opacity-40">Occupied</span>
      </div>
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

  const toggle = (seatId: string) => {
    const seat = seats.find((s) => s._id === seatId);
    if (!seat) return;

    const isSelected = selectedSeatIds.includes(seatId);
    if (isSelected) {
      onChangeSelectedIds(selectedSeatIds.filter((id) => id !== seatId));
      return;
    }

    if (!seat.isAvailable) return;
    if (selectedSeatIds.length >= maxSelected) return;

    onChangeSelectedIds([...selectedSeatIds, seatId]);
  };

  const seatClass = (s: SeatApi) => {
    const selected = selectedSeatIds.includes(s._id);
    if (selected)
      return "bg-[#ff2424] text-white font-bold border-[#ff2424] shadow-[0_0_12px_rgba(255,36,36,0.6)] scale-105";
    if (!s.isAvailable)
      return "bg-[#1a1c1c] text-white/20 border-[#2c2c2c] opacity-25 cursor-not-allowed";
    if (s.type === "vip")
      return "bg-[#241e12] text-[#eab308] border-[#eab308]/60 hover:bg-[#eab308] hover:text-black";
    if (s.type === "couple")
      return "bg-[#24131d] text-[#ec4899] border-[#ec4899]/60 hover:bg-[#ec4899] hover:text-white";
    return "bg-[#1e2020] text-white/90 border-[#2c2c2c] hover:bg-[#333535] hover:border-white/40";
  };

  return (
    <div className="rounded-xl border border-[#2c2c2c] bg-[#121414]/90 p-4 sm:p-8 backdrop-blur shadow-2xl">
      <Screen />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-4 border-b border-[#2c2c2c]">
        <Legend />
        <div className="text-xs text-white/60">
          Selected: <span className="font-bold text-[#ff2424]">{selectedSeatIds.length}</span> / {maxSelected}
        </div>
      </div>

      {/* Seats Matrix */}
      <div className="space-y-3 overflow-x-auto pb-4 hide-scrollbar">
        {normalized.rows.map((row) => {
          const rowSeats = normalized.byRow.get(row) || [];
          const byCol = new Map<number, SeatApi>();
          for (const s of rowSeats) byCol.set(parseSeatNumber(s.number).col, s);

          return (
            <div key={row} className="flex items-center justify-center gap-2 sm:gap-3 min-w-max">
              <span className="w-5 text-center font-bold text-xs text-white/50">{row}</span>

              <div
                className="grid gap-1.5 sm:gap-2"
                style={{ gridTemplateColumns: `repeat(${normalized.maxCol}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: normalized.maxCol }, (_, i) => {
                  const col = i + 1;
                  const seat = byCol.get(col);
                  if (!seat) return <div key={`${row}-${col}`} className="w-8 h-8 sm:w-10 sm:h-10" />;

                  const disabled = !seat.isAvailable && !selectedSeatIds.includes(seat._id);
                  return (
                    <button
                      key={seat._id}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggle(seat._id)}
                      className={cx(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded border text-xs font-semibold transition-all duration-200",
                        "flex items-center justify-center cursor-pointer",
                        seatClass(seat)
                      )}
                      title={`${seat.number} • ${seat.type.toUpperCase()} • ${ticketPrices[seat.type].toLocaleString("vi-VN")}đ`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>

              <span className="w-5 text-center font-bold text-xs text-white/50">{row}</span>
            </div>
          );
        })}
      </div>

      {/* Selected Seat Chips */}
      <div className="mt-6 pt-4 border-t border-[#2c2c2c] flex flex-wrap items-center gap-2">
        {selectedSeatIds.length === 0 ? (
          <span className="text-xs text-white/50 italic">Please pick seats on the chart above...</span>
        ) : (
          selectedSeatIds
            .map((id) => seats.find((s) => s._id === id))
            .filter(Boolean)
            .map((s) => (
              <span
                key={(s as SeatApi)._id}
                className="inline-flex items-center gap-2 rounded bg-[#ff2424]/15 border border-[#ff2424]/40 px-3 py-1 text-xs text-white"
              >
                <span className="font-bold text-[#ff2424]">{(s as SeatApi).number}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">
                  {ticketPrices[(s as SeatApi).type].toLocaleString("vi-VN")}đ
                </span>
              </span>
            ))
        )}
      </div>
    </div>
  );
}

