import dbConnect from "@/lib/mongodb";
import Cinema from "@/models/cinema";
import Showtime from "@/models/showtimes";

export async function POST(req, context) {
  await dbConnect();
  try {
    const { cinemaId } = await context.params;
    const { startTime, endTime } = await req.json();

    if (!startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: "Thiếu thời gian bắt đầu hoặc kết thúc" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return new Response(
        JSON.stringify({ error: "Thời gian không hợp lệ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Lấy rạp và populate rooms
    const cinema = await Cinema.findById(cinemaId).populate("rooms");
    if (!cinema) {
      return new Response(
        JSON.stringify({ error: "Không tìm thấy rạp" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Kiểm tra nếu rạp chưa có phòng nào
    if (!cinema.rooms || cinema.rooms.length === 0) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Tìm các suất chiếu bị overlap
    const occupiedShowtimes = await Showtime.find({
      cinema: cinemaId,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    }).populate("room");

    const occupiedRoomIds = occupiedShowtimes.map((s) =>
      s.room?._id?.toString()
    );

    // ✅ Lọc ra phòng trống
    const freeRooms = cinema.rooms.filter(
      (room) => !occupiedRoomIds.includes(room._id.toString())
    );

    return new Response(JSON.stringify(freeRooms), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error checking free rooms:", error);
    return new Response(
      JSON.stringify({ error: "Không thể kiểm tra phòng trống" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
