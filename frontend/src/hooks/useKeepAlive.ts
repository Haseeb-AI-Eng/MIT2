/**
 * useKeepAlive.ts
 *
 * Pings the Replit backend every 4 minutes so the server never cold-starts.
 * Import and call this ONCE at the top of your App (or any root component).
 *
 * Also does an immediate warm-up ping on first mount so the first data
 * fetch on News/Research pages never hits a cold server.
 */

import { useEffect } from 'react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://backend-forever--syedtech26.replit.app')
  .replace(/\/$/, '');

// Lightweight health endpoint — returns {status:'ok'} instantly
const PING_URL = `${API_BASE}/api/health`;

// Ping every 4 minutes (Replit idles after a period of inactivity)
const PING_INTERVAL_MS = 4 * 60 * 1000;

let globalPingTimer: ReturnType<typeof setInterval> | null = null;
let pinged = false;

function ping() {
  fetch(PING_URL, { method: 'GET', cache: 'no-store' }).catch(() => {
    // Silently ignore — network might be offline
  });
}

export function useKeepAlive() {
  useEffect(() => {
    // Only set up one global ping timer across the whole app
    if (!pinged) {
      pinged = true;
      ping(); // immediate warm-up on first load
    }

    if (!globalPingTimer) {
      globalPingTimer = setInterval(ping, PING_INTERVAL_MS);
    }

    // No cleanup — we want this running for the entire session
  }, []);
}