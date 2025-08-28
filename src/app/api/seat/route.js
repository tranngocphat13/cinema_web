import { connectDB } from "@/lib/mongodb";
import Seat from "@/lib/models/seat";

export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const showtimeId = searchParams.get("showtimeId");
  const seats = await Seat.find({ showtimeId });
  return Response.json(seats);
}

export async function PUT(req) {
  await connectDB();
  const { showtimeId, seatNumber } = await req.json();

  const holdUntil = new Date(Date.now() + 3 * 60 * 1000); // 3 phút giữ chỗ
  const seat = await Seat.findOneAndUpdate(
    { showtimeId, seatNumber, isBooked: false },
    { holdUntil },
    { new: true }
  );

  if (!seat) {
    return new Response(JSON.stringify({ error: "Ghế đã được giữ/đặt" }), { status: 400 });
  }

  return Response.json(seat);
}
