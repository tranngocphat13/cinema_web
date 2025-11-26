import { NextResponse } from "next/server";
import syncNowPlayingDaily from "@/lib/sync/tmdbNowPlayingDaily";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const secret = process.env.CRON_SECRET;

  if (secret && auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const result = await syncNowPlayingDaily({ force });

  return NextResponse.json({ ok: true, ...result });
}
