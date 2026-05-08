const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'https://5bc7c866-b21d-4da5-9995-61354fcbe425-00-38w7zdn4lxnur.pike.replit.dev';
  return url.endsWith('/api') ? url : `${url.replace(/\/$/, '')}/api`;
};

const API_BASE = getBaseUrl();

export const getApiUrl = () => API_BASE;

export async function fetchLatestArticles(limit = 20) {
  const res = await fetch(`${API_BASE}/articles/latest?limit=${limit}`);
  const data = await res.json();
  return data.articles;
}

export async function fetchArticleBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/articles/${slug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.article;
}

export async function fetchRelatedArticles(slug: string, limit = 4) {
  const res = await fetch(`${API_BASE}/articles/${slug}/related?limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles;
}

export async function searchArticles(query: string) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
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
  const res = await fetch(`${API_BASE}/articles?limit=50`);
  const data = await res.json();
  return data.articles;
}

export async function fetchFeaturedProjects(limit = 6) {
  const res = await fetch(`${API_BASE}/projects?featured=true&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.projects || [];
}

export async function fetchPublishedProjects(limit = 20, page = 1) {
  const res = await fetch(`${API_BASE}/projects?status=published&limit=${limit}&page=${page}`);
  if (!res.ok) return { projects: [], total: 0, page: 1, totalPages: 1 };
  return res.json();
}

export async function fetchProjectByIdOrSlug(idOrSlug: string) {
  const res = await fetch(`${API_BASE}/projects/${idOrSlug}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

export async function submitMasApplication(payload: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/form-submissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit application');
  return data;
}
