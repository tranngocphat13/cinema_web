// cron/dailySync.js
import cron from "node-cron";
import { syncMovies } from "@/lib/syncMovies";

cron.schedule("0 3 * * *", async () => {
  console.log("Running daily movie sync at 3:00 AM...");
  await syncMovies();
});