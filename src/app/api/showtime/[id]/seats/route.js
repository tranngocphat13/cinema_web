import connectDB from "@/lib/mongodb";
import Showtime from "@/models/showtime";

export async function GET(req, { params }) {
  await connectDB();
  const showtime = await Showtime.findById(params.id);
  if (!showtime) return new Response(JSON.stringify({ error: "Showtime not found" }), { status: 404 });
  return new Response(JSON.stringify(showtime.seats));
}
