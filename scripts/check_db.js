require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("No MONGODB_URI found in environment");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: "cinema" });
  console.log("Connected to MongoDB");

  const Movie = mongoose.models.Movie || mongoose.model("Movie", new mongoose.Schema({}, { strict: false }));
  const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", new mongoose.Schema({}, { strict: false }));
  const Room = mongoose.models.Room || mongoose.model("Room", new mongoose.Schema({}, { strict: false }));
  const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", new mongoose.Schema({}, { strict: false }));
  const Seat = mongoose.models.Seat || mongoose.model("Seat", new mongoose.Schema({}, { strict: false }));

  const movies = await Movie.find({});
  console.log(`Movies count: ${movies.length}`);
  movies.forEach(m => console.log(` - [${m._id}] ${m.title || m.originalTitle} (tmdbId: ${m.tmdbId}, runtime: ${m.runtime}m, status: ${m.status})`));

  const cinemas = await Cinema.find({});
  console.log(`Cinemas count: ${cinemas.length}`);
  for (const c of cinemas) {
    const rooms = await Room.find({ cinema: c._id });
    console.log(` - Cinema [${c._id}] ${c.name} (Rooms: ${rooms.length})`);
    for (const r of rooms) {
      const seatsCount = await Seat.countDocuments({ room: r._id });
      console.log(`    * Room [${r._id}] ${r.name} (${seatsCount} seats)`);
    }
  }

  const showtimes = await Showtime.find({});
  console.log(`Showtimes count: ${showtimes.length}`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
