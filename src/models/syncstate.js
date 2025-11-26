import mongoose from "mongoose";

const SyncStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },

    lastOkDayVN: { type: String, default: "" },
    lastOkAt: { type: Date, default: null },

    lastAttemptDayVN: { type: String, default: "" },
    lastAttemptAt: { type: Date, default: null },

    running: { type: Boolean, default: false },
    lockUntil: { type: Date, default: null },

    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.SyncState ||
  mongoose.model("SyncState", SyncStateSchema);
