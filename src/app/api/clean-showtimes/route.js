import dbConnect from "@/lib/mongodb";
import Showtime from "@/models/showtimes";

export async function GET() {
  try {
    await dbConnect();
    const now = new Date();
    const result = await Showtime.deleteMany({ endTime: { $lt: now } });

    return new Response(
      JSON.stringify({ deleted: result.deletedCount }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: "Không thể xoá suất chiếu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
