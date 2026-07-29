import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

export function PublicSiteEnhancements() {
  const { settings, resolvedMode, setVisitorMode } = useSiteSettings();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!settings.showReadingProgress) return;
    const update = () => {
      const page = document.documentElement;
      const max = Math.max(1, page.scrollHeight - window.innerHeight);
      setProgress(Math.min(100, Math.max(0, (window.scrollY / max) * 100)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [settings.showReadingProgress]);

  return (
    <>
      {settings.showReadingProgress && (
        <div className="site-reading-progress" aria-hidden="true">
          <div style={{ width: `${progress}%` }} />
        </div>
      )}

      {settings.allowVisitorThemeToggle && (
        <button
          type="button"
          className="site-theme-toggle"
          onClick={() => setVisitorMode(resolvedMode === 'dark' ? 'light' : 'dark')}
          aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedMode === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      )}
    </>
  );
}
