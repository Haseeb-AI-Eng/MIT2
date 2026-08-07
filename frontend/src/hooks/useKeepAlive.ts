/**
 * Lightweight backend warm-up.
 *
 * Railway does not need a four-minute browser heartbeat. Repeating that request
 * on every open tab wastes mobile bandwidth and can compete with the first
 * project/image requests. We do one delayed, non-blocking health request only.
 */
import { useEffect } from 'react';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'https://workspaceapi-server-production-003e.up.railway.app'
).replace(/\/$/, '');

const PING_URL = `${API_BASE}/api/health`;
let warmed = false;

export function useKeepAlive() {
  useEffect(() => {
    if (warmed) return;
    warmed = true;

    const warm = () => {
      fetch(PING_URL, { method: 'GET', cache: 'no-store', keepalive: true }).catch(() => {});
    };

    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (typeof win.requestIdleCallback === 'function') {
      const id = win.requestIdleCallback(warm, { timeout: 2500 });
      return () => win.cancelIdleCallback?.(id);
    }

    const timer = window.setTimeout(warm, 1800);
    return () => window.clearTimeout(timer);
  }, []);
}
