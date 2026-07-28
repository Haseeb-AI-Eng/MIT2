import { getApiUrl, clientCacheInvalidate } from './api';

function authHeaders(token: string | null, json = true): HeadersInit {
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function getToken() {
  return localStorage.getItem('token');
}

async function handle<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
    throw new Error('Session expired');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any).error || `Request failed (${res.status})`);
  return data as T;
}

const BASE = () => getApiUrl();

// ---- Dashboard ----
export const fetchDashboardSummary = () =>
  fetch(`${BASE()}/admin/dashboard-summary`, { headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Projects ----
export const adminFetchProjects = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE()}/projects${qs ? `?${qs}` : ''}`).then(handle<any>);
};
export const adminCreateProject = (payload: any) =>
  fetch(`${BASE()}/projects`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify(payload) })
    .then(handle<any>)
    .then((r) => { clientCacheInvalidate('projects'); return r; });
export const adminUpdateProject = (id: string, payload: any) =>
  fetch(`${BASE()}/projects/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) })
    .then(handle<any>)
    .then((r) => { clientCacheInvalidate('projects'); return r; });
export const adminDeleteProject = (id: string) =>
  fetch(`${BASE()}/projects/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) })
    .then(handle<any>)
    .then((r) => { clientCacheInvalidate('projects'); return r; });
export const adminSetProjectStatus = (id: string, status: string) =>
  fetch(`${BASE()}/projects/${id}/status`, { method: 'PATCH', headers: authHeaders(getToken()), body: JSON.stringify({ status }) })
    .then(handle<any>)
    .then((r) => { clientCacheInvalidate('projects'); return r; });

// ---- Articles ----
export const adminFetchArticles = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE()}/articles${qs ? `?${qs}` : ''}`).then(handle<any>);
};
export const adminCreateArticle = (payload: any) =>
  fetch(`${BASE()}/articles`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminUpdateArticle = (id: string, payload: any) =>
  fetch(`${BASE()}/articles/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminDeleteArticle = (id: string) =>
  fetch(`${BASE()}/articles/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Labs ----
export const adminFetchLabs = () => fetch(`${BASE()}/labs`).then(handle<any>);
export const adminCreateLab = (payload: any) =>
  fetch(`${BASE()}/labs`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminUpdateLab = (id: string, payload: any) =>
  fetch(`${BASE()}/labs/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminDeleteLab = (id: string) =>
  fetch(`${BASE()}/labs/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Tags ----
export const adminFetchTags = () => fetch(`${BASE()}/tags`).then(handle<any>);
export const adminCreateTag = (name: string) =>
  fetch(`${BASE()}/tags`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify({ name }) }).then(handle<any>);
export const adminDeleteTag = (id: string) =>
  fetch(`${BASE()}/tags/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Announcements ----
export const adminFetchAnnouncements = () => fetch(`${BASE()}/announcements`).then(handle<any>);
export const adminCreateAnnouncement = (payload: any) =>
  fetch(`${BASE()}/announcements`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminUpdateAnnouncement = (id: string, payload: any) =>
  fetch(`${BASE()}/announcements/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminDeleteAnnouncement = (id: string) =>
  fetch(`${BASE()}/announcements/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Users ----
export const adminFetchUsers = () => fetch(`${BASE()}/users`, { headers: authHeaders(getToken(), false) }).then(handle<any>);
export const adminCreateUser = (payload: any) =>
  fetch(`${BASE()}/users`, { method: 'POST', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminUpdateUser = (id: string, payload: any) =>
  fetch(`${BASE()}/users/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminDeleteUser = (id: string) =>
  fetch(`${BASE()}/users/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);

// ---- Form submissions (applications) ----
export const adminFetchSubmissions = (params: Record<string, string> = {}) => {
  const qs = new URLSearchParams(params).toString();
  return fetch(`${BASE()}/form-submissions${qs ? `?${qs}` : ''}`, { headers: authHeaders(getToken(), false) }).then(handle<any>);
};
export const adminFetchSubmissionStats = () =>
  fetch(`${BASE()}/form-submissions-stats`, { headers: authHeaders(getToken(), false) }).then(handle<any>);
export const adminUpdateSubmission = (id: string, payload: any) =>
  fetch(`${BASE()}/form-submissions/${id}`, { method: 'PUT', headers: authHeaders(getToken()), body: JSON.stringify(payload) }).then(handle<any>);
export const adminDeleteSubmission = (id: string) =>
  fetch(`${BASE()}/form-submissions/${id}`, { method: 'DELETE', headers: authHeaders(getToken(), false) }).then(handle<any>);
