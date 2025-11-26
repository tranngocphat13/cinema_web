import connectDB from "@/lib/mongodb";
import SyncState from "@/models/syncstate";
import syncNowPlayingLite from "@/lib/sync/tmdbNowPlayingLite";
import { vnDayKey } from "@/lib/vnDayKey";

export default async function syncNowPlayingDaily({ force = false } = {}) {
  await connectDB();

  const today = vnDayKey();
  const key = "tmdb:now_playing";
  const now = new Date();

  const state = await SyncState.findOne({ key }).lean();
  if (!force && state?.lastOkDayVN === today) {
    return { ran: false, today, lastOkAt: state.lastOkAt || null };
  }

  // lock 4 phút
  const lockUntil = new Date(Date.now() + 4 * 60 * 1000);

  const locked = await SyncState.findOneAndUpdate(
    {
      key,
      $or: [
        { lockUntil: { $lt: now } },
        { lockUntil: null },
        { lockUntil: { $exists: false } },
      ],
    },
    {
      $setOnInsert: { key },
      $set: {
        running: true,
        lockUntil,
        lastAttemptDayVN: today,
        lastAttemptAt: now,
      },
    },
    { upsert: true, new: true }
  );

  // Nếu không lấy được lock thì thôi (đang có process khác chạy)
  if (!locked?.running) {
    return { ran: false, today, reason: "lock-not-acquired" };
  }

  try {
    const result = await syncNowPlayingLite();
    await SyncState.updateOne(
      { key },
      {
        $set: {
          lastOkDayVN: today,
          lastOkAt: new Date(),
          lastError: "",
          running: false,
          lockUntil: new Date(0),
        },
      }
    );
    return { ran: true, today, ...result };
  } catch (e) {
    await SyncState.updateOne(
      { key },
      {
        $set: {
          lastError: e?.message || String(e),
          running: false,
          lockUntil: new Date(0),
        },
      }
    );
    throw e;
  }
}
