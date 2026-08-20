import dbConnect from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";

// ✅ Cập nhật showtime
export async function PUT(req, { params }) {
  await dbConnect();
  try {
    const { id } = await params;
    const { movieId, cinemaId, roomId, startTime } = await req.json();

    if (!movieId || !cinemaId || !roomId || !startTime) {
      return new Response(
        JSON.stringify({ error: "Thiếu dữ liệu đầu vào" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      return new Response(JSON.stringify({ error: "Phim không tồn tại" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    const cinema = await Cinema.findById(cinemaId);
    if (!cinema) {
      return new Response(JSON.stringify({ error: "Rạp không tồn tại" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return new Response(JSON.stringify({ error: "Phòng không tồn tại" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    const start = new Date(startTime);
    if (isNaN(start.getTime())) {
      return new Response(
        JSON.stringify({ error: "Thời gian bắt đầu không hợp lệ" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    const runtime = movie.runtime && movie.runtime > 0 ? movie.runtime : 120;
    const end = new Date(start.getTime() + runtime * 60000);

    // 🛡️ Kiểm tra xung đột phòng chiếu (+10 phút dọn vệ sinh, loại trừ suất chiếu đang sửa)
    const CLEANING_BUFFER_MS = 10 * 60 * 1000;
    const startBuffer = new Date(start.getTime() - CLEANING_BUFFER_MS);
    const endBuffer = new Date(end.getTime() + CLEANING_BUFFER_MS);

    const conflictingShowtime = await Showtime.findOne({
      _id: { $ne: id },
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

    const updated = await Showtime.findByIdAndUpdate(
      id,
      { movie: movieId, cinema: cinemaId, room: roomId, startTime: start, endTime: end },
      { new: true }
    ).populate("movie cinema room");

    if (!updated) {
      return new Response(JSON.stringify({ error: "Không tìm thấy suất chiếu" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(updated), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ PUT showtime error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ✅ Xóa showtime
export async function DELETE(_req, { params }) {
  await dbConnect();
  try {
    const { id } = params;
    const deleted = await Showtime.findByIdAndDelete(id);

    if (!deleted) {
      return new Response(JSON.stringify({ error: "Không tìm thấy suất chiếu" }), {
        status: 404, headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ message: "Xóa thành công" }), {
      status: 200, headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("❌ DELETE showtime error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
