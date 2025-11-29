import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Movie from "@/models/movies";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Env bạn cần:
 * - TMDB_READ_TOKEN  (khuyên dùng)  // TMDB API Read Access Token (v4 auth)
 * hoặc
 * - TMDB_API_KEY     (v3)
 *
 * - CRON_SECRET (tuỳ chọn): để tự gọi tay / bảo vệ endpoint
 */

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const DEFAULT_REGION = "VN";
const DEFAULT_LANGUAGE = "vi-VN";
const PAGES = 2; // lấy 2 trang now_playing (tuỳ bạn tăng/giảm)

function safeDateString(v) {
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function buildPosterUrl(path) {
  return path ? `${IMAGE_BASE}${path}` : undefined;
}
function buildBackdropUrl(path) {
  return path ? `${BACKDROP_BASE}${path}` : undefined;
}

async function tmdbFetch(path, params = {}) {
  const token = process.env.TMDB_READ_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const url = new URL(`${TMDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) url.searchParams.set(k, String(v));
  });

  // fallback v3 key
  if (!token && apiKey) url.searchParams.set("api_key", apiKey);

  const res = await fetch(url.toString(), {
    headers: token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json;charset=utf-8" } : {},
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`TMDB ${path} failed: ${res.status} ${txt}`.slice(0, 400));
  }
  return res.json();
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;

  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function listNowPlaying({ region, language }) {
  const pages = Array.from({ length: PAGES }, (_, i) => i + 1);

  const pageResults = await Promise.all(
    pages.map((page) =>
      tmdbFetch("/movie/now_playing", {
        page,
        region,
        language,
      })
    )
  );

  const all = pageResults.flatMap((r) => (Array.isArray(r?.results) ? r.results : []));
  // unique by id
  const map = new Map();
  for (const m of all) map.set(m.id, m);
  return Array.from(map.values());
}

async function getMovieRuntimeIfMissing(tmdbId, language) {
  // gọi detail để lấy runtime (list now_playing không có runtime)
  const detail = await tmdbFetch(`/movie/${tmdbId}`, { language });
  const runtime = typeof detail?.runtime === "number" ? detail.runtime : null;
  return runtime;
}

export async function GET(req) {
  try {
    // ---- Guard (tuỳ chọn) ----
    // Nếu deploy Vercel Cron: thường sẽ có header x-vercel-cron
    const isVercelCron = req.headers.get("x-vercel-cron") === "1";
    const url = new URL(req.url);
    const secret = url.searchParams.get("secret");
    const required = process.env.CRON_SECRET;

    if (required && !isVercelCron && secret !== required) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    // ---- Params ----
    const region = url.searchParams.get("region") || DEFAULT_REGION;
    const language = url.searchParams.get("language") || DEFAULT_LANGUAGE;
    const status = url.searchParams.get("status") || "now_playing"; // bạn đang dùng "now_playing"

    // ---- Connect DB ----
    await connectDB();

    // ---- List TMDB ----
    const tmdbMovies = await listNowPlaying({ region, language });
    const tmdbIds = tmdbMovies.map((m) => m.id);

    // ---- Check existing to avoid fetching runtime for all ----
    const existing = await Movie.find(
      { tmdbId: { $in: tmdbIds } },
      { tmdbId: 1, runtime: 1 }
    ).lean();

    const runtimeMap = new Map(existing.map((x) => [x.tmdbId, x.runtime]));

    // ---- Fetch runtime only when missing (limit concurrency) ----
    const needRuntimeIds = tmdbIds.filter((id) => {
      const rt = runtimeMap.get(id);
      return !(typeof rt === "number" && rt > 0);
    });

    const runtimePairs = await mapLimit(
      needRuntimeIds,
      6,
      async (id) => [id, await getMovieRuntimeIfMissing(id, language)]
    );

    for (const [id, runtime] of runtimePairs) {
      if (typeof runtime === "number" && runtime > 0) runtimeMap.set(id, runtime);
    }

    // ---- Upsert to Mongo ----
    const ops = tmdbMovies.map((m) => {
      const releaseDateIso = safeDateString(m.release_date);
      const runtime = runtimeMap.get(m.id);

      const update = {
        tmdbId: m.id,
        title: m.title || m.original_title || "Untitled",
        releaseDate: releaseDateIso || null,
        posterUrl: buildPosterUrl(m.poster_path),
        backdropUrl: buildBackdropUrl(m.backdrop_path),
        status, // "now_playing"
      };

      // chỉ set runtime nếu có
      if (typeof runtime === "number" && runtime > 0) update.runtime = runtime;

      return {
        updateOne: {
          filter: { tmdbId: m.id },
          update: { $set: update },
          upsert: true,
        },
      };
    });

    const bulk = ops.length ? await Movie.bulkWrite(ops, { ordered: false }) : null;

    // (Tuỳ chọn) Nếu muốn dọn status now_playing cũ (không còn nằm trong TMDB list)
    // await Movie.updateMany(
    //   { status: "now_playing", tmdbId: { $nin: tmdbIds } },
    //   { $set: { status: "archived" } }
    // );

    return NextResponse.json({
      ok: true,
      region,
      language,
      status,
      totalFromTmdb: tmdbMovies.length,
      upserted: bulk?.upsertedCount ?? 0,
      modified: bulk?.modifiedCount ?? 0,
      matched: bulk?.matchedCount ?? 0,
      runtimeFetched: needRuntimeIds.length,
    });
  } catch (e) {
    console.error("❌ sync-tmdb error:", e);
    return NextResponse.json(
      { ok: false, error: e?.message || "Sync failed" },
      { status: 500 }
    );
  }
}
