import dbConnect from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";

// ✅ Lấy tất cả showtimes
export async function GET() {
  await dbConnect();
  try {
    const showtimes = await Showtime.find()
      .populate("movie")
      .populate("cinema")
      .populate("room");

    return new Response(JSON.stringify(showtimes), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ GET showtimes error:", error);
    return new Response(
      JSON.stringify({ error: "Không thể lấy danh sách suất chiếu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ✅ Tạo mới showtime
export async function POST(req) {
  await dbConnect();
  try {
    const { movieId, cinemaId, roomId, startTime } = await req.json();

    if (!movieId || !cinemaId || !roomId || !startTime) {
      return new Response(
        JSON.stringify({ error: "Thiếu dữ liệu đầu vào" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Kiểm tra movie tồn tại
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return new Response(JSON.stringify({ error: "Phim không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kiểm tra cinema tồn tại
    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return new Response(JSON.stringify({ error: "Rạp không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Kiểm tra room tồn tại
    const room = await Room.findById(roomId);
    if (!room) {
      return new Response(JSON.stringify({ error: "Phòng chiếu không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Tính giờ kết thúc dựa vào runtime phim
    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.runtime * 60000);

    // ✅ Map đúng field schema (movie, cinema, room)
    const newShowtime = await Showtime.create({
      movie: movieId,
      cinema: cinemaId,
      room: roomId,
      startTime: start,
      endTime: end,
    });

    return new Response(JSON.stringify(newShowtime), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ POST showtime error:", error);
    return new Response(
      JSON.stringify({ error: "Không thể tạo suất chiếu" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
