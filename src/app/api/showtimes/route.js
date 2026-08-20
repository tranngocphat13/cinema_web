import dbConnect from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";

// Lấy showtimes (filter theo movieId, cinemaId, roomId)
// Đồng thời xoá các suất chiếu đã hết hạn
export async function GET(req) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    let movieId = searchParams.get("movieId");
    const cinemaId = searchParams.get("cinemaId");
    const roomId = searchParams.get("roomId");

    const filter = {};

    if (movieId) {
      // Nếu movieId không phải ObjectId thì coi như tmdbId
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(movieId);
      if (!isObjectId) {
        const movie = await Movie.findOne({ tmdbId: Number(movieId) });
        if (!movie) {
          return new Response(JSON.stringify({ error: "Phim không tồn tại" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        movieId = movie._id; // chuyển sang _id
      }
      filter.movie = movieId;
    }

    if (cinemaId) filter.cinema = cinemaId;
    if (roomId) filter.room = roomId;

    // 🧹 Xoá suất chiếu đã hết hạn trong background
    Showtime.deleteMany({ endTime: { $lt: new Date() } }).catch(() => {});

    // Lấy danh sách suất chiếu còn hạn với .lean() tối ưu tốc độ
    const showtimes = await Showtime.find(filter)
      .populate("movie")
      .populate("cinema")
      .populate("room")
      .lean();

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

// Tạo showtime
export async function POST(req) {
  await dbConnect();
  try {
    const { movieId, cinemaId, roomId, startTime } = await req.json();

    if (!movieId || !cinemaId || !roomId || !startTime) {
      return new Response(JSON.stringify({ error: "Thiếu dữ liệu đầu vào" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // check tồn tại
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return new Response(JSON.stringify({ error: "Phim không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return new Response(JSON.stringify({ error: "Rạp không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return new Response(
        JSON.stringify({ error: "Phòng chiếu không tồn tại" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Tính giờ kết thúc = startTime + runtime phim
    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return new Response(JSON.stringify({ error: "Thời gian bắt đầu không hợp lệ" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const runtime = movie.runtime && movie.runtime > 0 ? movie.runtime : 120;
    const end = new Date(start.getTime() + runtime * 60000);

    // 🛡️ Kiểm tra xung đột phòng chiếu (+10 phút dọn vệ sinh)
    const CLEANING_BUFFER_MS = 10 * 60 * 1000;
    const startBuffer = new Date(start.getTime() - CLEANING_BUFFER_MS);
    const endBuffer = new Date(end.getTime() + CLEANING_BUFFER_MS);

    const conflictingShowtime = await Showtime.findOne({
      room: roomId,
      startTime: { $lt: endBuffer },
      endTime: { $gt: startBuffer },
    }).populate("movie");

    if (conflictingShowtime) {
      const confStart = new Date(conflictingShowtime.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const confEnd = new Date(conflictingShowtime.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const cleanEnd = new Date(conflictingShowtime.endTime.getTime() + CLEANING_BUFFER_MS).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const movieTitle = conflictingShowtime.movie?.title || "khác";

      return new Response(
        JSON.stringify({
          error: `Phòng này đã có suất chiếu phim "${movieTitle}" từ ${confStart} đến ${confEnd} (cộng 10 phút dọn phòng đến ${cleanEnd}). Vui lòng chọn giờ hoặc phòng khác.`,
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const newShowtime = await Showtime.create({
      movie: movieId,
      cinema: cinemaId,
      room: roomId,
      startTime: start,
      endTime: end,
    });

    await newShowtime.populate("movie cinema room");

    return new Response(JSON.stringify(newShowtime), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ POST showtime error:", error);
    return new Response(JSON.stringify({ error: "Không thể tạo suất chiếu" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
