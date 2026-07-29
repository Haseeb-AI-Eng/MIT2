import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getApiUrl } from '../api';

export interface SiteColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  destructive: string;
  border: string;
}

export type AppearanceMode = 'light' | 'dark' | 'system';

export interface SiteSettings {
  _id?: string;
  siteName: string;
  tagline: string;
  logoText: string;
  faviconUrl: string;
  colors: SiteColors;
  darkColors: SiteColors;
  appearanceMode: AppearanceMode;
  allowVisitorThemeToggle: boolean;
  showReadingProgress: boolean;
  radius: string;
  fontSans: string;
  socialLinks: { twitter: string; instagram: string; youtube: string; linkedin: string };
  maintenanceMode: boolean;
  updatedAt?: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Elements Interactive',
  tagline: 'Media Lab Research Group',
  logoText: 'ELEMENTS',
  faviconUrl: '',
  colors: {
    primary: '#030213',
    secondary: '#f0f0f4',
    accent: '#910B08',
    background: '#ffffff',
    foreground: '#0a0a0a',
    muted: '#ececf0',
    mutedForeground: '#717182',
    destructive: '#d4183d',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  darkColors: {
    primary: '#f5f7ff',
    secondary: '#20242d',
    accent: '#d43a36',
    background: '#0b0d12',
    foreground: '#f5f7fb',
    muted: '#171a22',
    mutedForeground: '#a9b0bf',
    destructive: '#ff5d73',
    border: 'rgba(255, 255, 255, 0.14)',
  },
  appearanceMode: 'light',
  allowVisitorThemeToggle: true,
  showReadingProgress: true,
  radius: '0.625',
  fontSans: 'Poppins',
  socialLinks: { twitter: '', instagram: '', youtube: '', linkedin: '' },
  maintenanceMode: false,
};

interface SiteSettingsContextValue {
  settings: SiteSettings;
  loading: boolean;
  previewSettings: SiteSettings | null;
  setPreview: (s: SiteSettings | null) => void;
  refresh: () => Promise<void>;
  saveSettings: (s: SiteSettings, token: string) => Promise<SiteSettings>;
  resetSettings: (token: string) => Promise<SiteSettings>;
  resolvedMode: 'light' | 'dark';
  visitorMode: 'light' | 'dark' | null;
  setVisitorMode: (mode: 'light' | 'dark' | null) => void;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

function resolveAppearanceMode(settings: SiteSettings, visitorMode: 'light' | 'dark' | null): 'light' | 'dark' {
  if (settings.allowVisitorThemeToggle && visitorMode) return visitorMode;
  if (settings.appearanceMode === 'system') {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return settings.appearanceMode === 'dark' ? 'dark' : 'light';
}

function applyThemeToDocument(settings: SiteSettings, resolvedMode: 'light' | 'dark') {
  const root = document.documentElement;
  const c = resolvedMode === 'dark' ? settings.darkColors : settings.colors;
  root.dataset.siteMode = resolvedMode;
  root.classList.toggle('site-dark', resolvedMode === 'dark');
  root.style.colorScheme = resolvedMode;
  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--sidebar-primary', c.primary);
  root.style.setProperty('--secondary', c.secondary);
  root.style.setProperty('--accent-brand', c.accent);
  root.style.setProperty('--background', c.background);
  root.style.setProperty('--foreground', c.foreground);
  root.style.setProperty('--muted', c.muted);
  root.style.setProperty('--muted-foreground', c.mutedForeground);
  root.style.setProperty('--destructive', c.destructive);
  root.style.setProperty('--border', c.border);
  root.style.setProperty('--radius', `${settings.radius}rem`);
  if (settings.fontSans) {
    const fontStack = `'${settings.fontSans}', 'Helvetica Neue', Arial, sans-serif`;
    root.style.setProperty('--font-sans', fontStack);
    document.body.style.fontFamily = fontStack;
  }
  if (settings.siteName) document.title = settings.siteName;
  if (settings.faviconUrl) {
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.faviconUrl;
  }
}

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [previewSettings, setPreviewSettings] = useState<SiteSettings | null>(null);
  const [visitorMode, setVisitorModeState] = useState<'light' | 'dark' | null>(() => {
    const saved = localStorage.getItem('elements-visitor-theme');
    return saved === 'light' || saved === 'dark' ? saved : null;
  });

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) }, darkColors: { ...DEFAULT_SETTINGS.darkColors, ...(data.settings?.darkColors || {}) } };
        setSettings(merged);
      }
    } catch {
      // fall back silently to defaults; site should still render
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const activeSettings = previewSettings || settings;
  const resolvedMode = resolveAppearanceMode(activeSettings, visitorMode);

  useEffect(() => {
    applyThemeToDocument(activeSettings, resolvedMode);
  }, [activeSettings, resolvedMode]);

  useEffect(() => {
    if (activeSettings.appearanceMode !== 'system' || visitorMode) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeToDocument(activeSettings, media.matches ? 'dark' : 'light');
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [activeSettings, visitorMode]);

  const setVisitorMode = useCallback((mode: 'light' | 'dark' | null) => {
    setVisitorModeState(mode);
    if (mode) localStorage.setItem('elements-visitor-theme', mode);
    else localStorage.removeItem('elements-visitor-theme');
  }, []);

  const saveSettings = useCallback(async (newSettings: SiteSettings, token: string) => {
    const res = await fetch(`${getApiUrl()}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(newSettings),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save settings');
    }
    const data = await res.json();
    const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) }, darkColors: { ...DEFAULT_SETTINGS.darkColors, ...(data.settings?.darkColors || {}) } };
    setSettings(merged);
    setPreviewSettings(null);
    return merged;
  }, []);

  const resetSettings = useCallback(async (token: string) => {
    const res = await fetch(`${getApiUrl()}/settings/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to reset settings');
    const data = await res.json();
    const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) }, darkColors: { ...DEFAULT_SETTINGS.darkColors, ...(data.settings?.darkColors || {}) } };
    setSettings(merged);
    setPreviewSettings(null);
    return merged;
  }, []);

  const value = useMemo(
    () => ({ settings, loading, previewSettings, setPreview: setPreviewSettings, refresh, saveSettings, resetSettings, resolvedMode, visitorMode, setVisitorMode }),
    [settings, loading, previewSettings, refresh, saveSettings, resetSettings, resolvedMode, visitorMode, setVisitorMode]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
