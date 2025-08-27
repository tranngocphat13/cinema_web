import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtime";
import Booking from "@/models/booking";


export async function POST(req) {
  await connectDB();
  const { bookingId } = await req.json();
  const booking = await Booking.findById(bookingId);
  if (!booking) return new Response(JSON.stringify({ error: "Booking not found" }), { status: 404 });

  const now = new Date();
  if (booking.holdExpires < now) return new Response(JSON.stringify({ error: "Booking hết hạn" }), { status: 400 });

  // xác nhận
  booking.status = "confirmed";
  await booking.save();

  const showtime = await Showtime.findById(booking.showtime);
  showtime.seats.forEach(s => { if (booking.seats.includes(s.label)) s.status = "confirmed"; });
  await showtime.save();

  const qrData = `Booking:${booking._id} Seats:${booking.seats.join(",")}`;
  return new Response(JSON.stringify({ success: true, qrData }));
}
