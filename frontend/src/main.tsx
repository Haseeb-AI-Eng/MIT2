
  import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App.tsx";
import "./styles/index.css";


// Warm up the API/image CDNs early so cards start painting sooner on mobile.
if (typeof document !== 'undefined') {
  const origins = new Set<string>();
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    try { origins.add(new URL(apiUrl).origin); } catch {}
  }
  origins.add('https://images.pexels.com');
  origins.add('https://images.unsplash.com');

  origins.forEach((origin) => {
    if (document.head.querySelector(`link[rel="preconnect"][href="${origin}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Prevent browser from restoring scroll position on navigation
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
  