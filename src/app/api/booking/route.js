import { connectDB } from "@/lib/mongodb";
import Booking from "@/lib/models/booking";
import Seat from "@/lib/models/seat";

export async function POST(req) {
  await connectDB();
  const { movie, showtime, seats, user } = await req.json();

  // cập nhật ghế thành booked
  await Seat.updateMany(
    { showtimeId: showtime, seatNumber: { $in: seats } },
    { isBooked: true, holdUntil: null }
  );

  const booking = new Booking({ movie, showtime, seats, user, status: "paid" });
  await booking.save();

  return Response.json(booking);
}
