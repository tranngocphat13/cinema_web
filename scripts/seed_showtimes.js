require("dotenv").config();
const mongoose = require("mongoose");

async function seedShowtimes() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ No MONGODB_URI found in .env");
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: "cinema" });
  console.log("✅ Connected to MongoDB");

  const Movie = mongoose.models.Movie || mongoose.model("Movie", new mongoose.Schema({}, { strict: false }));
  const Cinema = mongoose.models.Cinema || mongoose.model("Cinema", new mongoose.Schema({}, { strict: false }));
  const Room = mongoose.models.Room || mongoose.model("Room", new mongoose.Schema({}, { strict: false }));
  const Seat = mongoose.models.Seat || mongoose.model("Seat", new mongoose.Schema({}, { strict: false }));
  const Showtime = mongoose.models.Showtime || mongoose.model("Showtime", new mongoose.Schema({
    movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    cinema: { type: mongoose.Schema.Types.ObjectId, ref: "Cinema", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  }, { timestamps: true }));

  // 1. Setup Cinemas
  const cinemaDefs = [
    { name: "Quan 7", address: "335 Nguyễn Hữu Thọ, Quận 7, TP.HCM" },
    { name: "CGV Landmark 81", address: "Tầng B1, Landmark 81, Bình Thạnh, TP.HCM" },
    { name: "CGV Vincom Đồng Khởi", address: "72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP.HCM" },
    { name: "CGV Sala Thủ Thiêm", address: "10 Mai Chí Thọ, TP. Thủ Đức, TP.HCM" },
  ];

  const cinemaList = [];
  for (const cDef of cinemaDefs) {
    let cDoc = await Cinema.findOne({ name: cDef.name });
    if (!cDoc) {
      cDoc = await Cinema.create(cDef);
    }
    cinemaList.push(cDoc);
  }
  console.log(`🏢 Cinemas ready: ${cinemaList.length} cinemas`);

  // 2. Setup Rooms and Seats for each cinema
  const allRooms = [];
  const roomNames = ["Phòng 1", "Phòng 2", "Phòng 3", "Phòng 4", "Phòng 5", "Phòng 6"];

  for (const c of cinemaList) {
    for (const rName of roomNames) {
      let rDoc = await Room.findOne({ cinema: c._id, name: rName });
      if (!rDoc) {
        rDoc = await Room.create({ cinema: c._id, name: rName });
      }
      allRooms.push({ room: rDoc, cinema: c });

      // Ensure seats exist for this room
      const seatCount = await Seat.countDocuments({ room: rDoc._id });
      if (seatCount === 0) {
        const seats = [];
        const rows = ["A", "B", "C", "D", "E"];
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowLetter = rows[rIdx];
          for (let col = 1; col <= 8; col++) {
            let type = "normal";
            if (rowLetter === "C" || rowLetter === "D") type = "vip";
            if (rowLetter === "E") type = "couple";

            seats.push({
              number: `${rowLetter}${col}`,
              row: rowLetter,
              column: col,
              type,
              room: rDoc._id,
              isAvailable: true,
            });
          }
        }
        await Seat.insertMany(seats);
      }
    }
  }
  console.log(`🚪 Rooms ready: ${allRooms.length} rooms with seats across all cinemas`);

  // 3. Fetch Movies
  const movies = await Movie.find({});
  console.log(`📽️ Movies in DB: ${movies.length} movies`);
  if (movies.length === 0) {
    console.log("❌ No movies to seed showtimes for.");
    await mongoose.disconnect();
    return;
  }

  // 4. Clear existing showtimes
  const deleted = await Showtime.deleteMany({});
  console.log(`🧹 Cleared ${deleted.deletedCount} old showtimes.`);

  // 5. Intelligent Collision-Free Scheduling with 10-Minute Cleaning Buffer
  const CLEANING_BUFFER_MINUTES = 10;
  const now = new Date();

  // Create timeline tracking for each room per day (for 7 days: Day 0 to Day 6)
  // roomTimelines[roomKey][dayOffset] = Date (next available start time)
  const roomTimelines = {};
  for (const rItem of allRooms) {
    const rId = rItem.room._id.toString();
    roomTimelines[rId] = {};
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
      if (dayOffset === 0) {
        // Today: start 30 minutes from current time or at 08:30
        const startToday = new Date(now.getTime() + 30 * 60 * 1000);
        // Round up to nearest 10 mins
        startToday.setMinutes(Math.ceil(startToday.getMinutes() / 10) * 10, 0, 0);
        roomTimelines[rId][dayOffset] = startToday;
      } else {
        // Future days: start at 08:30 AM
        baseDate.setHours(8, 30, 0, 0);
        roomTimelines[rId][dayOffset] = baseDate;
      }
    }
  }

  const showtimeDocs = [];
  const SHOWTIMES_PER_MOVIE = 10;

  let roomIndexCursor = 0;

  for (let mIdx = 0; mIdx < movies.length; mIdx++) {
    const movie = movies[mIdx];
    const runtime = movie.runtime && movie.runtime > 0 ? movie.runtime : 110;

    let scheduledForMovie = 0;
    let attempts = 0;

    // Distribute 10 showtimes across 7 days
    while (scheduledForMovie < SHOWTIMES_PER_MOVIE && attempts < 100) {
      attempts++;
      const targetDayOffset = (scheduledForMovie + Math.floor(attempts / allRooms.length)) % 7;
      const rItem = allRooms[roomIndexCursor % allRooms.length];
      roomIndexCursor++;

      const rId = rItem.room._id.toString();
      const nextAvail = roomTimelines[rId][targetDayOffset];

      const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + targetDayOffset, 23, 40, 0, 0);

      // Check if slot fits before midnight
      const estimatedEnd = new Date(nextAvail.getTime() + runtime * 60 * 1000);
      if (estimatedEnd.getTime() <= dayEnd.getTime()) {
        const startTime = new Date(nextAvail.getTime());
        const endTime = new Date(startTime.getTime() + runtime * 60 * 1000);

        showtimeDocs.push({
          movie: movie._id,
          cinema: rItem.cinema._id,
          room: rItem.room._id,
          startTime: startTime,
          endTime: endTime,
        });

        // Advance room timeline: endTime + 10 mins cleaning buffer
        const nextStart = new Date(endTime.getTime() + CLEANING_BUFFER_MINUTES * 60 * 1000);
        roomTimelines[rId][targetDayOffset] = nextStart;

        scheduledForMovie++;
      }
    }
  }

  console.log(`⏳ Inserting ${showtimeDocs.length} valid, collision-free showtimes...`);
  const inserted = await Showtime.insertMany(showtimeDocs);
  console.log(`✅ Successfully seeded ${inserted.length} showtimes!`);

  // 6. Validation Verification: Verify zero overlaps and +10 min buffer in all rooms
  console.log("\n🔍 Verifying schedule integrity (collision & buffer check)...");
  let violations = 0;
  for (const rItem of allRooms) {
    const roomShowtimes = await Showtime.find({ room: rItem.room._id }).sort({ startTime: 1 });
    for (let i = 0; i < roomShowtimes.length - 1; i++) {
      const cur = roomShowtimes[i];
      const next = roomShowtimes[i + 1];
      const curEndWithBuffer = new Date(cur.endTime.getTime() + CLEANING_BUFFER_MINUTES * 60 * 1000);
      if (curEndWithBuffer > next.startTime) {
        console.error(`❌ Overlap found in room ${rItem.room.name}: [${cur.startTime.toISOString()} - ${cur.endTime.toISOString()}] vs [${next.startTime.toISOString()}]`);
        violations++;
      }
    }
  }

  if (violations === 0) {
    console.log("🎉 VERIFICATION PASSED: 100% of showtimes have zero room collision and respect +10 min cleaning buffer!");
  } else {
    console.warn(`⚠️ Found ${violations} violations.`);
  }

  // Print sample for "Whistle" / "Còi Tử Thần"
  const whistleMovie = await Movie.findOne({
    $or: [{ title: /còi tử thần/i }, { titleEn: /whistle/i }, { originalTitle: /whistle/i }]
  });
  if (whistleMovie) {
    const whistleShowtimes = await Showtime.find({ movie: whistleMovie._id })
      .populate("cinema room")
      .sort({ startTime: 1 });
    console.log(`\n📋 10 Showtimes for "${whistleMovie.title}" (${whistleMovie.titleEn || whistleMovie.originalTitle}):`);
    whistleShowtimes.forEach((st, idx) => {
      console.log(`   ${idx + 1}. [${st.cinema?.name} - ${st.room?.name}] ${st.startTime.toLocaleString("vi-VN")} -> ${st.endTime.toLocaleTimeString("vi-VN")} (+10m dọn phòng đến ${new Date(st.endTime.getTime() + 10*60*1000).toLocaleTimeString("vi-VN")})`);
    });
  }

  await mongoose.disconnect();
}

seedShowtimes().catch((err) => {
  console.error("❌ Error seeding showtimes:", err);
  process.exit(1);
});
