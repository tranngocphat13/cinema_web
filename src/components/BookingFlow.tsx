"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

// ====== Interfaces ======
interface Cinema {
  _id: string;
  name: string;
  address?: string;
}

interface Showtime {
  _id: string;
  startTime: string;
  room: {
    _id: string;
    name: string;
  };
}

interface Seat {
  _id: string;
  number: string;
  type: "normal" | "vip" | "couple";
  isAvailable: boolean;
}

interface BookingResponse {
  _id: string;
  total: number;
  status: "pending" | "paid" | "cancelled";
}

// ====== Component ======
const BookingFlow = ({ movieId }: { movieId: string }) => {
  const [step, setStep] = useState(1);

  // cinema
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);

  // showtime
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(
    null
  );

  // seats
  const [seats, setSeats] = useState<Seat[]>([]);
  const [chosenSeats, setChosenSeats] = useState<string[]>([]);

  // ticket
  const [ticketType, setTicketType] = useState<"adult" | "student" | "child">(
    "adult"
  );

  // booking
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  // ====== Fetch data ======
  useEffect(() => {
    // fetch cinemas
    fetch("/api/cinemas")
      .then((res) => res.json())
      .then((data: Cinema[]) => setCinemas(data));
  }, []);

  useEffect(() => {
    if (!selectedCinema) return;
    // fetch showtimes by cinema + movie
    fetch(`/api/showtimes?movie=${movieId}&cinema=${selectedCinema._id}`)
      .then((res) => res.json())
      .then((data: Showtime[]) => setShowtimes(data));
  }, [selectedCinema, movieId]);

  useEffect(() => {
    if (!selectedShowtime) return;
    // fetch seats for showtime
    fetch(`/api/showtimes/${selectedShowtime._id}/seats`)
      .then((res) => res.json())
      .then((data: Seat[]) => setSeats(data));
  }, [selectedShowtime]);

  // ====== Handlers ======
  const toggleSeat = (id: string) => {
    setChosenSeats((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleBooking = async () => {
    if (!selectedShowtime) return;

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showtimeId: selectedShowtime._id,
        seatIds: chosenSeats,
        ticketType,
      }),
    });

    const data: BookingResponse = await res.json();
    if (data._id) {
      setBooking(data);
      setStep(6);
    }
  };

  // ====== Render ======
  return (
    <div className="space-y-6">
      {/* Step 1: chọn chi nhánh */}
      {step === 1 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Chọn chi nhánh</h2>
          <div className="flex flex-col gap-2">
            {cinemas.map((c) => (
              <Button
                key={c._id}
                variant={selectedCinema?._id === c._id ? "default" : "outline"}
                onClick={() => {
                  setSelectedCinema(c);
                  setStep(2);
                }}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: chọn suất chiếu */}
      {step === 2 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Chọn suất chiếu</h2>
          <div className="flex flex-col gap-2">
            {showtimes.map((st) => (
              <Button
                key={st._id}
                variant={
                  selectedShowtime?._id === st._id ? "default" : "outline"
                }
                onClick={() => {
                  setSelectedShowtime(st);
                  setStep(3);
                }}
              >
                {new Date(st.startTime).toLocaleString()} - Phòng {st.room.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: chọn ghế */}
      {step === 3 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Chọn ghế</h2>
          <div className="grid grid-cols-8 gap-2 max-w-md">
            {seats.map((seat) => (
              <Button
                key={seat._id}
                variant={
                  chosenSeats.includes(seat._id)
                    ? "default"
                    : seat.isAvailable
                    ? "outline"
                    : "destructive"
                }
                disabled={!seat.isAvailable}
                onClick={() => toggleSeat(seat._id)}
              >
                {seat.number}
              </Button>
            ))}
          </div>
          <Button
            className="mt-4"
            onClick={() => setStep(4)}
            disabled={chosenSeats.length === 0}
          >
            Tiếp tục
          </Button>
        </div>
      )}

      {/* Step 4: chọn loại vé */}
      {step === 4 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Chọn loại vé</h2>
          <div className="flex gap-4">
            {(["adult", "student", "child"] as const).map((type) => (
              <Button
                key={type}
                variant={ticketType === type ? "default" : "outline"}
                onClick={() => setTicketType(type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <Button className="mt-4" onClick={() => setStep(5)}>
            Tiếp tục
          </Button>
        </div>
      )}

      {/* Step 5: thanh toán */}
      {step === 5 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Thanh toán</h2>
          <Button onClick={handleBooking}>Xác nhận & Thanh toán</Button>
        </div>
      )}

      {/* Step 6: thành công */}
      {step === 6 && booking && (
        <div className="text-green-600 font-bold text-lg">
          🎉 Đặt vé thành công! Mã đặt vé: {booking._id}
          <br />
          Tổng tiền: {booking.total.toLocaleString()} VND
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
