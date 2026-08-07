// Ensure the base URL points to the current origin when no environment API URL is configured.
const defaultApiUrl =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4173');
const apiOrigin = defaultApiUrl.replace(/\/$/, '');
const API_BASE = apiOrigin + (apiOrigin.endsWith('/api') ? '' : '/api');

export const getApiUrl = () => API_BASE;

function isLikelyVideoUrl(value: string) {
  const clean = value.toLowerCase().split('?')[0];
  return /\.(mp4|webm|ogg|mov|m4v)$/.test(clean) || clean.includes('/video/upload/') || clean.includes('videos.pexels.com');
}

/**
 * Resolve the best image for a project card.
 * Prefer an explicit image URL, then use the backend image endpoint. The backend
 * endpoint is important because list endpoints often return only `hasImage`
 * instead of embedding the stored image itself.
 */
function optimizeExternalImageUrl(value: string, width: number) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();

    if (host === 'images.unsplash.com') {
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '70');
      return url.toString();
    }

    if (host === 'images.pexels.com') {
      url.searchParams.set('auto', 'compress');
      url.searchParams.set('cs', 'tinysrgb');
      url.searchParams.set('w', String(width));
      return url.toString();
    }
  } catch {
    // Keep non-URL values unchanged below.
  }

  return value;
}

function normalizeBackendImageUrl(value: string, width: number) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  // Any project-image endpoint should always point at the configured API
  // origin. This repairs stale Replit URLs and Railway-generated localhost
  // URLs without touching normal external images.
  try {
    const parsed = new URL(trimmed, apiOrigin);
    const isProjectImage = /\/api\/projects\/[^/]+\/image\/?$/i.test(parsed.pathname);
    const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);

    if (isProjectImage || isLocalHost) {
      const path = parsed.pathname.startsWith('/api/')
        ? parsed.pathname
        : `/api${parsed.pathname.startsWith('/') ? parsed.pathname : `/${parsed.pathname}`}`;
      const url = new URL(`${apiOrigin}${path}`);
      url.searchParams.set('w', String(width));
      url.searchParams.set('q', '72');
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
  } catch {
    // Relative paths are handled below.
  }

  if (/^\/api\/projects\/[^/]+\/image\/?$/i.test(trimmed)) {
    const url = new URL(`${apiOrigin}${trimmed}`);
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', '72');
    url.searchParams.set('format', 'webp');
    return url.toString();
  }

  // Backend-hosted upload paths must resolve against Railway, not Vercel.
  if (/^\/(uploads|media|files)\//i.test(trimmed)) {
    return `${apiOrigin}${trimmed}`;
  }

  return optimizeExternalImageUrl(trimmed, width);
}

/**
 * Resolve a lightweight, public image URL for project cards.
 * - Never exposes Railway/container localhost URLs to visitors.
 * - Requests a compressed WebP thumbnail from the backend for stored images.
 * - Requests smaller variants from Unsplash/Pexels when possible.
 */
export function getProjectImageUrl(project: any, width = 720): string {
  if (!project) return '';

  const candidates = [
    project.coverImageUrl,
    project.coverImage,
    project.cover_image,
    project.image,
    project.imageUrl,
    project.image_url,
    project.thumbnail,
    project.thumbnailUrl,
    project.poster,
  ];

  for (const value of candidates) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed || isLikelyVideoUrl(trimmed)) continue;
    return normalizeBackendImageUrl(trimmed, width);
  }

  // Fast list endpoints provide `hasImage` without embedding the large base64
  // payload. Only request the image endpoint when the backend says one exists.
  if (project.hasImage === false) return '';
  const id = project._id ?? project.id ?? project.slug;
  if (!id || project.hasImage !== true) return '';

  const url = new URL(`${API_BASE}/projects/${encodeURIComponent(String(id))}/image`);
  url.searchParams.set('w', String(width));
  url.searchParams.set('q', '72');
  url.searchParams.set('format', 'webp');
  return url.toString();
}

// ---- Client-side in-memory cache ----
interface CacheEntry { data: unknown; ts: number }
const _clientCache = new Map<string, CacheEntry>();
const CLIENT_CACHE_TTL = 30 * 60_000; // 30 minutes (increased from 5 to handle Replit rate limiting)

// ---- Request deduplication (prevent duplicate in-flight requests) ----
const _inFlightRequests = new Map<string, Promise<any>>();

function clientCacheGet<T>(key: string): T | null {
  const entry = _clientCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CLIENT_CACHE_TTL) { _clientCache.delete(key); return null; }
  return entry.data as T;
}
function clientCacheSet(key: string, data: unknown) {
  _clientCache.set(key, { data, ts: Date.now() });
}
function getInFlightRequest<T>(key: string): Promise<T> | undefined {
  return _inFlightRequests.get(key);
}
function setInFlightRequest<T>(key: string, promise: Promise<T>) {
  _inFlightRequests.set(key, promise);
  return promise.finally(() => _inFlightRequests.delete(key));
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
  const res = await fetchWithTimeout(
    `${API_BASE}/projects/fast?featured=true&limit=${limit}`,
    { signal }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const result = data.projects || [];
  clientCacheSet(cacheKey, result);
  return result;
}

export function dedupeProjectList(projects: any[]) {
  const seen = new Set<string>();
  return projects.filter((project) => {
    const idKey = project?._id ?? project?.slug;
    const titleKey = project?.title && String(project.title).trim();
    const key = idKey ? String(idKey) : titleKey || "";
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  if (cached) {
    console.log(`[API] fetchPublishedProjects: Cache hit for ${cacheKey}`, cached);
    return cached;
  }

  // Check if this request is already in-flight
  const inFlight = getInFlightRequest<ProjectListResult>(cacheKey);
  if (inFlight) {
    console.log(`[API] fetchPublishedProjects: Request already in-flight for ${cacheKey}, returning that promise`);
    return inFlight;
  }

  // Use the new /fast endpoint — no $lookup joins, returns instantly
  console.log(`[API] fetchPublishedProjects: Fetching from ${API_BASE}/projects/fast?status=published&limit=${limit}&page=${page}`);
  const fetchPromise = fetchWithTimeout(
    `${API_BASE}/projects/fast?status=published&limit=${limit}&page=${page}`,
    { signal }
  )
  .then(res => {
    if (!res.ok) {
      console.error(`[API] fetchPublishedProjects: Failed to fetch projects. Status: ${res.status}`);
      return { projects: [], total: 0, page: 1, totalPages: 1 };
    }
    return res.json();
  })
  .then(data => {
    const result: ProjectListResult = {
      projects: data.projects || [],
      total: data.total || 0,
      page: data.page || page,
      totalPages: data.totalPages || 1,
    };
    clientCacheSet(cacheKey, result);
    console.log(`[API] fetchPublishedProjects: Fetched ${result.projects.length} projects. Total: ${result.total}`);
    return result;
  });

  return setInFlightRequest(cacheKey, fetchPromise);
}

export async function fetchAllPublishedProjects(signal?: AbortSignal): Promise<ProjectListResult> {
  const firstPage = await fetchPublishedProjects(100, 1, signal);
  if (firstPage.totalPages <= 1) {
    return firstPage;
  }

  const pagePromises: Promise<ProjectListResult>[] = [];
  for (let page = 2; page <= firstPage.totalPages; page += 1) {
    pagePromises.push(fetchPublishedProjects(100, page, signal));
  }

  const remainingPages = await Promise.all(pagePromises);
  const allProjects = [firstPage.projects, ...remainingPages.map((pageResult) => pageResult.projects)].flat();
  const dedupedProjects = dedupeProjectList(allProjects);

  return {
    ...firstPage,
    projects: dedupedProjects,
    total: dedupedProjects.length,
    totalPages: 1,
  };
}

export async function fetchProjectByIdOrSlug(idOrSlug: string, signal?: AbortSignal) {
  const res = await fetch(`${API_BASE}/projects/${idOrSlug}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

const LOCAL_PROJECT_VIEWS_KEY = 'project_views';

function readLocalJSON<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeLocalJSON(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

export function getLocalProjectViews(): Record<string, number> {
  const stored = readLocalJSON<Record<string, number>>(LOCAL_PROJECT_VIEWS_KEY);
  return stored && typeof stored === 'object' ? stored : {};
}

export function getLocalProjectViewCount(projectId: string): number {
  const views = getLocalProjectViews();
  return views[projectId] ?? 0;
}

export function markLocalProjectViewed(projectId: string): number {
  if (typeof window === 'undefined' || !projectId) return 0;
  const viewedKey = `viewed_project_${projectId}`;
  if (window.localStorage.getItem(viewedKey) === 'true') {
    return getLocalProjectViewCount(projectId);
  }
  const views = getLocalProjectViews();
  const nextViews = {
    ...views,
    [projectId]: (views[projectId] ?? 0) + 1,
  };
  writeLocalJSON(LOCAL_PROJECT_VIEWS_KEY, nextViews);
  window.localStorage.setItem(viewedKey, 'true');
  return nextViews[projectId];
}

// ---- Server-side View Tracking ----
export async function trackProjectView(projectIdOrSlug: string) {
  try {
    // Generate a simple device fingerprint
    const deviceFingerprint = `${navigator.userAgent}`;
    
    const res = await fetch(`${API_BASE}/projects/${projectIdOrSlug}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceFingerprint }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.viewCount;
  } catch (err) {
    console.error('Failed to track project view:', err);
    return null;
  }
}

export async function fetchProjectViewCount(projectIdOrSlug: string): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/projects/${projectIdOrSlug}/views`);
    if (!res.ok) return 0;
    const data = await res.json();
    return data.viewCount ?? 0;
  } catch (err) {
    console.error('Failed to fetch project view count:', err);
    return 0;
  }
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