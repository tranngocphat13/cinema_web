import { NextResponse } from "next/server";
import syncNowPlaying from "@/lib/sync/tmdbNowPlaying";

export const dynamic = "force-dynamic"; // tắt cache route

export async function POST(request) {
  try {
    const { months = 1 } = await request.json().catch(() => ({ months: 1 }));
    const result = await syncNowPlaying({ months });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
