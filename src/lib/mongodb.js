// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env");
}

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return mongoose;

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      dbName: "test", // đổi theo tên database của bạn
    });
    isConnected = true;
    console.log("MongoDB connected");
    return conn;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}
