import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtime";
import Booking from "@/models/booking";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  const { showtimeId, seats, user } = body;

  const showtime = await Showtime.findById(showtimeId);
  if (!showtime) return new Response(JSON.stringify({ error: "Showtime not found" }), { status: 404 });

  // kiểm tra ghế còn trống
  const unavailable = seats.filter(s => {
    const seat = showtime.seats.find(x => x.label === s);
    return !seat || seat.status !== "available";
  });
  if (unavailable.length) return new Response(JSON.stringify({ error: `Ghế ${unavailable.join(", ")} đã được đặt` }), { status: 400 });

  // giữ ghế
  const now = new Date();
  const holdExpires = new Date(now.getTime() + 5*60*1000); // 5 phút
  showtime.seats.forEach(s => { if (seats.includes(s.label)) s.status = "held"; });
  await showtime.save();

  const booking = await Booking.create({ showtime: showtime._id, seats, status: "held", holdExpires, user });

  return new Response(JSON.stringify({ success: true, bookingId: booking._id, holdExpires }));
}
