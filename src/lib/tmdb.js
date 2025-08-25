const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE = "https://api.themoviedb.org/3";

function qs(params) {
  const u = new URLSearchParams({ api_key: TMDB_API_KEY, ...params });
  return u.toString();
}

async function fetchJson(path, params = {}) {
  const url = `${BASE}${path}?${qs(params)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`TMDB ${path} failed: ${res.status} ${t}`);
  }
  return res.json();
}

export async function getGenreMap(language = "vi-VN") {
  const data = await fetchJson("/genre/movie/list", { language });
  // Map id -> name
  const map = new Map();
  for (const g of data.genres || []) map.set(g.id, g.name);
  return map;
}

export async function getNowPlayingPages({ region = "VN", language = "vi-VN", maxPages = 5 } = {}) {
  const first = await fetchJson("/movie/now_playing", { region, language, page: 1 });
  const total = Math.min(first.total_pages || 1, maxPages);
  const pages = [first.results || []];

  for (let p = 2; p <= total; p++) {
    const data = await fetchJson("/movie/now_playing", { region, language, page: p });
    pages.push(data.results || []);
  }
  return pages.flat();
}

export async function getMovieDetail(id, language = "vi-VN") {
  return fetchJson(`/movie/${id}`, { language });
}

export async function getMovieVideos(id, language = "vi-VN") {
  return fetchJson(`/movie/${id}/videos`, { language });
}

// Lấy phân loại (rating) Việt Nam nếu có (VD: C13/C16/C18…)
export async function getVNReleaseCertification(id) {
  const data = await fetchJson(`/movie/${id}/release_dates`);
  const vn = (data.results || []).find((r) => r.iso_3166_1 === "VN");
  const cert = vn?.release_dates?.find((d) => d.certification)?.certification;
  return cert || "";
}
