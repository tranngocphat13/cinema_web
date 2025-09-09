import dbConnect from "@/lib/mongodb";
import Showtime from "@/models/showtimes";
import Movie from "@/models/movies";
import Cinema from "@/models/cinema";
import Room from "@/models/room";

// Lấy showtimes (filter theo movieId, cinemaId, roomId)
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

    const showtimes = await Showtime.find(filter)
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
      return new Response(JSON.stringify({ error: "Phòng chiếu không tồn tại" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // tính giờ kết thúc
    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.runtime * 60000);

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
