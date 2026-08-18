import axios from "axios";
import https from "node:https";
import dns from "node:dns";

const resolver = new dns.Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);

const httpsAgent = new https.Agent({
  keepAlive: true,
  lookup: (hostname, options, callback) => {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }
    dns.lookup(hostname, options, (err, address, family) => {
      if (!err && address) return callback(null, address, family);
      resolver.resolve4(hostname, (resErr, addresses) => {
        if (resErr || !addresses?.length) return callback(resErr || err);
        if (options && options.all) {
          callback(null, addresses.map((addr) => ({ address: addr, family: 4 })));
        } else {
          callback(null, addresses[0], 4);
        }
      });
    });
  },
});

const apiClient = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  httpsAgent,
  timeout: 15000,
});

async function fetchJson(path, params = {}) {
  const apiKey = process.env.TMDB_API_KEY;
  const token = process.env.TMDB_READ_TOKEN;

  const headers = {};
  const queryParams = { ...params };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (apiKey) {
    queryParams.api_key = apiKey;
  }

  const response = await apiClient.get(path, {
    params: queryParams,
    headers,
  });

  return response.data;
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
