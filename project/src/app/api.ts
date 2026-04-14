const API_BASE = '/api';

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
  return data.results;
}

export async function triggerScrape() {
  const res = await fetch(`${API_BASE}/scrape`, { method: 'POST' });
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchAllArticles() {
  const res = await fetch(`${API_BASE}/articles?limit=50`);
  const data = await res.json();
  return data.articles;
}
