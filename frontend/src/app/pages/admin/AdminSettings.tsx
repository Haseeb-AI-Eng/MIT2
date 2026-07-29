import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Save, RotateCcw, Palette, Type, Globe, Share2, Moon, Sun, Monitor, Sparkles } from 'lucide-react';
import { useSiteSettings, SiteSettings } from '../../contexts/SiteSettingsContext';
import { LogoIcon } from '../../components/Logo';
import { toast } from 'sonner';

const COLOR_FIELDS: { key: keyof SiteSettings['colors']; label: string; help: string }[] = [
  { key: 'primary', label: 'Primary (UI / buttons)', help: 'Main interactive color across the site' },
  { key: 'accent', label: 'Brand Accent', help: 'Logo, highlights, and admin panel accent' },
  { key: 'secondary', label: 'Secondary', help: 'Secondary buttons and surfaces' },
  { key: 'background', label: 'Background', help: 'Page background color' },
  { key: 'foreground', label: 'Text / Foreground', help: 'Default body text color' },
  { key: 'muted', label: 'Muted Surface', help: 'Subtle backgrounds, cards' },
  { key: 'mutedForeground', label: 'Muted Text', help: 'Secondary / helper text' },
  { key: 'destructive', label: 'Destructive', help: 'Errors and delete actions' },
];

const FONT_OPTIONS = ['Poppins', 'Inter', 'Roboto', 'Montserrat', 'Lato', 'Work Sans'];

const APPEARANCE_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun, help: 'Always publish the light theme' },
  { value: 'dark', label: 'Dark', icon: Moon, help: 'Always publish the dark theme' },
  { value: 'system', label: 'System', icon: Monitor, help: "Follow each visitor's device setting" },
] as const;

export function AdminSettingsPage() {
  const { settings, saveSettings, resetSettings, setPreview } = useSiteSettings();
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const token = localStorage.getItem('token') || '';

  useEffect(() => { setForm(settings); }, [settings]);

  // Live-preview across the whole app while editing
  useEffect(() => {
    setPreview(form);
    return () => setPreview(null);
  }, [form]); // eslint-disable-line

  const updateColor = (key: keyof SiteSettings['colors'], value: string, palette: 'colors' | 'darkColors' = 'colors') => {
    setForm((prev) => ({ ...prev, [palette]: { ...prev[palette], [key]: value } }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await saveSettings(form, token);
      setForm(saved);
      toast.success('Site settings saved and applied');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const defaults = await resetSettings(token);
      setForm(defaults);
      toast.success('Reset to default theme');
    } catch (e: any) {
      toast.error(e.message || 'Failed to reset');
    } finally {
      setResetting(false);
    }
  };

  return (
    <AdminLayout
      title="Site & Theme Settings"
      subtitle="Changes preview live across the site — save to publish them"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={resetting} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save & Publish'}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <Tabs defaultValue="branding">
            <TabsList className="mb-6">
              <TabsTrigger value="branding" className="gap-2"><Globe className="w-4 h-4" /> Branding</TabsTrigger>
              <TabsTrigger value="colors" className="gap-2"><Palette className="w-4 h-4" /> Colors</TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2"><Moon className="w-4 h-4" /> Appearance</TabsTrigger>
              <TabsTrigger value="typography" className="gap-2"><Type className="w-4 h-4" /> Typography</TabsTrigger>
              <TabsTrigger value="social" className="gap-2"><Share2 className="w-4 h-4" /> Social</TabsTrigger>
            </TabsList>

            <TabsContent value="branding" className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div>
                  <Label className="mb-1.5 block">Site Name</Label>
                  <Input value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Tagline</Label>
                  <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Logo Text</Label>
                  <Input value={form.logoText} onChange={(e) => setForm({ ...form, logoText: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Favicon URL</Label>
                  <Input value={form.faviconUrl} onChange={(e) => setForm({ ...form, faviconUrl: e.target.value })} placeholder="https://.../favicon.png" />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                  <div>
                    <Label className="block">Maintenance Mode</Label>
                    <p className="text-xs text-slate-500">Flag the site as under maintenance (informational only)</p>
                  </div>
                  <Switch checked={form.maintenanceMode} onCheckedChange={(v) => setForm({ ...form, maintenanceMode: v })} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {COLOR_FIELDS.map((f) => (
                    <div key={f.key}>
                      <Label className="mb-1.5 block">{f.label}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={/^#/.test(form.colors[f.key]) ? form.colors[f.key] : '#000000'}
                          onChange={(e) => updateColor(f.key, e.target.value)}
                          className="w-10 h-10 rounded-lg border border-slate-300 cursor-pointer shrink-0"
                        />
                        <Input value={form.colors[f.key]} onChange={(e) => updateColor(f.key, e.target.value)} className="font-mono text-sm" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{f.help}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Label className="mb-1.5 block">Corner Radius ({form.radius}rem)</Label>
                  <input
                    type="range" min="0" max="1.5" step="0.125" value={form.radius}
                    onChange={(e) => setForm({ ...form, radius: e.target.value })}
                    className="w-full accent-[var(--accent-brand,#910B08)]"
                  />
                </div>
              </div>
            </TabsContent>


            <TabsContent value="appearance" className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <Label className="mb-3 block">Published appearance</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {APPEARANCE_OPTIONS.map(({ value, label, icon: Icon, help }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm({ ...form, appearanceMode: value })}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          form.appearanceMode === value
                            ? 'border-[var(--accent-brand,#910B08)] ring-2 ring-[var(--accent-brand,#910B08)]/15 bg-red-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-3" />
                        <p className="font-bold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-500 mt-1">{help}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <Label className="block">Visitor theme switch</Label>
                      <p className="text-xs text-slate-500 mt-1">Show a floating light/dark toggle on the public website.</p>
                    </div>
                    <Switch checked={form.allowVisitorThemeToggle} onCheckedChange={(v) => setForm({ ...form, allowVisitorThemeToggle: v })} />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <Label className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Reading progress bar</Label>
                      <p className="text-xs text-slate-500 mt-1">A modern progress indicator appears while visitors scroll.</p>
                    </div>
                    <Switch checked={form.showReadingProgress} onCheckedChange={(v) => setForm({ ...form, showReadingProgress: v })} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <Moon className="w-5 h-5" />
                  <div>
                    <p className="font-bold">Dark-mode palette</p>
                    <p className="text-xs text-slate-400">These colors are applied when dark mode is active.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {COLOR_FIELDS.map((f) => (
                    <div key={`dark-${f.key}`}>
                      <Label className="mb-1.5 block text-slate-200">{f.label}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={/^#/.test(form.darkColors[f.key]) ? form.darkColors[f.key] : '#000000'}
                          onChange={(e) => updateColor(f.key, e.target.value, 'darkColors')}
                          className="w-10 h-10 rounded-lg border border-slate-700 cursor-pointer shrink-0 bg-transparent"
                        />
                        <Input
                          value={form.darkColors[f.key]}
                          onChange={(e) => updateColor(f.key, e.target.value, 'darkColors')}
                          className="font-mono text-sm bg-slate-900 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <Label className="mb-2 block">Font Family</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font}
                      onClick={() => setForm({ ...form, fontSans: font })}
                      className={`px-4 py-3 rounded-lg border text-left transition-colors ${
                        form.fontSans === font ? 'border-[var(--accent-brand,#910B08)] bg-[var(--accent-brand,#910B08)]/5' : 'border-slate-200 hover:border-slate-300'
                      }`}
                      style={{ fontFamily: font }}
                    >
                      <span className="text-sm font-semibold text-slate-900">{font}</span>
                      <p className="text-xs text-slate-500 mt-0.5">The quick brown fox</p>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                {(['twitter', 'instagram', 'youtube', 'linkedin'] as const).map((key) => (
                  <div key={key}>
                    <Label className="mb-1.5 block capitalize">{key}</Label>
                    <Input
                      value={form.socialLinks?.[key] || ''}
                      onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, [key]: e.target.value } })}
                      placeholder={`https://${key}.com/yourhandle`}
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live preview panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="p-3 border-b border-slate-200 bg-slate-50">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Live Preview</p>
            </div>
            {(() => { const previewColors = form.appearanceMode === 'dark' ? form.darkColors : form.colors; return (
            <div className="p-6" style={{ background: previewColors.background, color: previewColors.foreground, fontFamily: form.fontSans }}>
              <div className="flex items-center gap-2 mb-6">
                <LogoIcon height={28} outlineColor={previewColors.foreground} />
                <div>
                  <p className="font-bold text-sm">{form.logoText || 'ELEMENTS'}</p>
                  <p className="text-[10px] opacity-60">{form.tagline}</p>
                </div>
              </div>
              <div className="rounded-lg p-4 mb-3" style={{ background: previewColors.muted }}>
                <p className="text-sm font-semibold mb-1">Sample Card</p>
                <p className="text-xs" style={{ color: previewColors.mutedForeground }}>
                  This is how muted surfaces and secondary text look with your chosen palette.
                </p>
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                  style={{ background: previewColors.primary, borderRadius: `${form.radius}rem` }}
                >
                  Primary Button
                </button>
                <button
                  className="px-4 py-2 text-sm font-semibold"
                  style={{ background: previewColors.secondary, borderRadius: `${form.radius}rem` }}
                >
                  Secondary
                </button>
              </div>
              <div
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white inline-block"
                style={{ background: previewColors.accent, borderRadius: `${form.radius}rem` }}
              >
                Brand Accent
              </div>
              <p className="text-xs mt-4" style={{ color: previewColors.destructive }}>● Destructive / error state</p>
            </div>
            ); })()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
