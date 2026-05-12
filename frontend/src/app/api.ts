// Ensure the base URL points to production by default if the environment variable is missing
const API_BASE = (import.meta.env.VITE_API_URL || 'https://fa4e55f3-ea39-4816-8922-f3fd2de36bb8-00-36ew1zcapayw1.pike.replit.dev').replace(/\/$/, '') + (import.meta.env.VITE_API_URL?.endsWith('/api') ? '' : '/api');

export const getApiUrl = () => API_BASE;

// ---- Client-side in-memory cache ----
interface CacheEntry { data: unknown; ts: number }
const _clientCache = new Map<string, CacheEntry>();
const CLIENT_CACHE_TTL = 5 * 60_000; // 5 minutes (was 30s — projects don't change that often)

function clientCacheGet<T>(key: string): T | null {
  const entry = _clientCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CLIENT_CACHE_TTL) { _clientCache.delete(key); return null; }
  return entry.data as T;
}
function clientCacheSet(key: string, data: unknown) {
  _clientCache.set(key, { data, ts: Date.now() });
}
export function clientCacheInvalidate(prefix: string) {
  for (const k of _clientCache.keys()) { if (k.startsWith(prefix)) _clientCache.delete(k); }
}

// ---- Shared fetch with timeout ----
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: options.signal ?? controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

export async function fetchLatestArticles(limit = 20, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/articles/latest?limit=${limit}`, { signal });
  const data = await res.json();
  return data.articles;
}

export async function fetchArticleBySlug(slug: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/articles/${slug}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return data.article;
}

export async function fetchRelatedArticles(slug: string, limit = 4, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/articles/${slug}/related?limit=${limit}`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles;
}

export async function searchArticles(query: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, { signal });
  const data = await res.json();
  return data.results || [];
}

export async function triggerScrape() {
  const res = await fetch(`${API_BASE}/scrape`, { method: 'POST' });
  if (!res.ok) throw new Error('Scrape failed');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) return { totalArticles: 0, lastScrape: null };
  const data = await res.json();
  return data;
}

export async function fetchAllArticles() {
  const res = await fetch(`${API_BASE}/articles?limit=20`);
  const data = await res.json();
  return data.articles;
}

export async function fetchFeaturedProjects(limit = 6, signal?: AbortSignal) {
  const cacheKey = `featured-projects:${limit}`;
  const cached = clientCacheGet<any[]>(cacheKey);
  if (cached) return cached;
  const res = await fetchWithTimeout(`${API_BASE}/projects/fast?featured=true&limit=${limit}`, { signal });
  if (!res.ok) return [];
  const data = await res.json();
  const result = data.projects || [];
  clientCacheSet(cacheKey, result);
  return result;
}

export interface ProjectListResult {
  projects: any[];
  total: number;
  page: number;
  totalPages: number;
}

export async function fetchPublishedProjects(
  limit = 20,
  page = 1,
  signal?: AbortSignal
): Promise<ProjectListResult> {
  const cacheKey = `published-projects:${limit}:${page}`;
  const cached = clientCacheGet<ProjectListResult>(cacheKey);
  if (cached) return cached;

  // Use the new /fast endpoint — no $lookup joins, returns instantly
  const res = await fetchWithTimeout(
    `${API_BASE}/projects/fast?status=published&limit=${limit}&page=${page}`,
    { signal }
  );
  if (!res.ok) return { projects: [], total: 0, page: 1, totalPages: 1 };
  const data = await res.json();
  const result: ProjectListResult = {
    projects: data.projects || [],
    total: data.total || 0,
    page: data.page || page,
    totalPages: data.totalPages || 1,
  };
  clientCacheSet(cacheKey, result);
  return result;
}

export async function fetchProjectByIdOrSlug(idOrSlug: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/projects/${idOrSlug}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

export async function submitMasApplication(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/form-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit application');
  return data;
}