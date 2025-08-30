"use client";

import { use, useEffect, useState, useCallback } from "react";

interface Seat {
  _id?: string;
  number: string;
  type: "normal" | "vip" | "couple";
  isAvailable: boolean;
  row: string;
  column: number;
}

interface AdminSeatsPageProps {
  params: Promise<{ cinemaId: string; roomId: string }>;
}

export default function AdminSeatsPage({ params }: AdminSeatsPageProps) {
  const { cinemaId, roomId } = use(params);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(8);
  const [loading, setLoading] = useState(true);

  // Lấy sơ đồ ghế từ DB
  const fetchSeats = useCallback(async () => {
    const res = await fetch(`/api/cinemas/${cinemaId}/rooms/${roomId}/seats`);
    if (res.ok) {
      const data: Seat[] = await res.json();
      setSeats(data);
    }
    setLoading(false);
  }, [cinemaId, roomId]);

  useEffect(() => {
    fetchSeats();
  }, [fetchSeats]);

  // Tạo sơ đồ ghế (chỉ khi DB chưa có)
  const generateSeats = () => {
    if (seats.length > 0) {
      alert("Phòng này đã có sơ đồ ghế, không thể tạo lại!");
      return;
    }
    const newSeats: Seat[] = [];
    for (let r = 0; r < rows; r++) {
      const rowLetter = String.fromCharCode(65 + r); // A, B, C...
      for (let c = 1; c <= cols; c++) {
        let type: "normal" | "vip" | "couple" = "normal";

        // 👉 HÀNG CUỐI CÙNG sẽ thành ghế đôi (couple)
        if (r === rows - 1) type = "couple";

        newSeats.push({
          number: `${rowLetter}${c}`,
          row: rowLetter,
          column: c,
          type,
          isAvailable: true,
        });
      }
    }
    setSeats(newSeats);
  };

  // Lưu sơ đồ ghế xuống DB
  const saveSeats = async () => {
    const res = await fetch(`/api/cinemas/${cinemaId}/rooms/${roomId}/seats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seats),
    });
    if (res.ok) {
      alert("Đã lưu sơ đồ ghế!");
      fetchSeats();
    } else {
      alert("Lưu thất bại!");
    }
  };

  // Đổi loại ghế
  const changeSeatType = (index: number) => {
    const newSeats = [...seats];
    const current = newSeats[index];

    // Nếu là hàng cuối (ghế đôi) → đổi luôn cả 2 ghế kề nhau
    if (current.row === String.fromCharCode(65 + rows - 1)) {
      const pairIndex = newSeats.findIndex(
        (s) => s.row === current.row && s.column === current.column + 1
      );

      if (pairIndex !== -1) {
        // Nếu đang couple → chuyển thành normal
        if (current.type === "couple") {
          newSeats[index].type = "normal";
          newSeats[pairIndex].type = "normal";
        } else {
          // Ngược lại → cả 2 thành couple
          newSeats[index].type = "couple";
          newSeats[pairIndex].type = "couple";
        }
      }
    } else {
      // Bình thường: đổi loại theo vòng lặp normal → vip → couple
      if (current.type === "normal") current.type = "vip";
      else if (current.type === "vip") current.type = "couple";
      else current.type = "normal";
    }

    setSeats(newSeats);
  };

  // Nhóm ghế theo hàng
  const seatsByRow = seats.reduce<Record<string, Seat[]>>((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  Object.keys(seatsByRow).forEach((row) => {
    seatsByRow[row].sort((a, b) => a.column - b.column);
  });

  if (loading) return <p>Đang tải sơ đồ ghế...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Thiết lập sơ đồ ghế phòng</h1>

      {seats.length === 0 && (
        <div className="flex gap-2 mb-4">
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value))}
            className="border px-2 py-1 rounded"
            placeholder="Số hàng"
          />
          <input
            type="number"
            min={1}
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value))}
            className="border px-2 py-1 rounded"
            placeholder="Số cột"
          />
          <button
            onClick={generateSeats}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Tạo sơ đồ
          </button>
        </div>
      )}

      {seats.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            {Object.keys(seatsByRow).map((row) => (
              <div key={row} className="flex gap-2 justify-start">
                {seatsByRow[row].map((seat) => (
                  <div
                    key={seat.number}
                    onClick={() =>
                      changeSeatType(seats.findIndex((s) => s.number === seat.number))
                    }
                    className={`w-10 h-10 flex items-center justify-center border rounded cursor-pointer
                      ${seat.type === "normal" ? "bg-white" : ""}
                      ${seat.type === "vip" ? "bg-yellow-300" : ""}
                      ${seat.type === "couple" ? "bg-pink-300" : ""}
                      ${!seat.isAvailable ? "bg-red-500 text-white" : ""}
                    `}
                  >
                    {seat.number}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border bg-white" /> <span>Ghế thường</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border bg-yellow-300" /> <span>Ghế VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border bg-pink-300" /> <span>Ghế đôi</span>
            </div>
          </div>

          <button
            onClick={saveSeats}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            Lưu sơ đồ ghế
          </button>
        </>
      )}
    </div>
  );
}
