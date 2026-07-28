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

export interface SiteSettings {
  _id?: string;
  siteName: string;
  tagline: string;
  logoText: string;
  faviconUrl: string;
  colors: SiteColors;
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
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | undefined>(undefined);

function applyThemeToDocument(settings: SiteSettings) {
  const root = document.documentElement;
  const c = settings.colors;
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
    root.style.setProperty('--font-sans', `'${settings.fontSans}', 'Helvetica Neue', Arial, sans-serif`);
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

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${getApiUrl()}/settings`);
      if (res.ok) {
        const data = await res.json();
        const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) } };
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

  useEffect(() => {
    applyThemeToDocument(previewSettings || settings);
  }, [settings, previewSettings]);

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
    const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) } };
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
    const merged = { ...DEFAULT_SETTINGS, ...data.settings, colors: { ...DEFAULT_SETTINGS.colors, ...(data.settings?.colors || {}) } };
    setSettings(merged);
    setPreviewSettings(null);
    return merged;
  }, []);

  const value = useMemo(
    () => ({ settings, loading, previewSettings, setPreview: setPreviewSettings, refresh, saveSettings, resetSettings }),
    [settings, loading, previewSettings, refresh, saveSettings, resetSettings]
  );

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
