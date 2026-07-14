import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { TopPageNav } from '../components/TopPageNav';

interface Announcement {
  _id?: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

const STORAGE_KEY = 'alumni-community-updates';
const AUTH_STORAGE_KEY = 'alumni-community-admin';
const VALID_ADMIN_CREDENTIALS = [
  { email: 'haseebmine24@gmail.com', password: 'ChangeMe123!' },
  { email: 'admin@example.com', password: 'ChangeMe123!' },
];

function loadAnnouncements() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAnnouncements(nextAnnouncements: Announcement[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextAnnouncements));
}

export function AlumniFriends() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedAnnouncements = loadAnnouncements();
    setAnnouncements(storedAnnouncements);

    if (typeof window !== 'undefined') {
      try {
        const authRaw = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (authRaw) {
          const parsed = JSON.parse(authRaw);
          setIsAdmin(Boolean(parsed?.isAdmin));
        }
      } catch {
        // ignore malformed auth data
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = adminEmail.trim().toLowerCase();
    const isValidCredential = VALID_ADMIN_CREDENTIALS.some(
      (credential) => credential.email === normalizedEmail && credential.password === adminPassword
    );

    if (isValidCredential) {
      setIsAdmin(true);
      setAuthError('');
      setShowAdminPrompt(false);
      setShowForm(true);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ isAdmin: true, email: normalizedEmail }));
      }
      return;
    }

    setAuthError('Only the admin account can post community updates.');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowForm(false);
    setShowAdminPrompt(false);
    setAdminEmail('');
    setAdminPassword('');
    setAuthError('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setAuthError('Please sign in as admin to post updates.');
      return;
    }

    if (!formData.title.trim() || !formData.content.trim() || !formData.authorName.trim() || !formData.authorEmail.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const newAnnouncement: Announcement = {
        _id: `${Date.now()}`,
        title: formData.title.trim(),
        content: formData.content.trim(),
        authorName: formData.authorName.trim(),
        authorEmail: formData.authorEmail.trim(),
        createdAt: new Date().toISOString(),
      };

      const nextAnnouncements = [newAnnouncement, ...announcements];
      setAnnouncements(nextAnnouncements);
      saveAnnouncements(nextAnnouncements);
      setFormData({ title: '', content: '', authorName: '', authorEmail: '' });
      setShowForm(false);
      setAuthError('');
      alert('Community update posted successfully.');
    } catch (err) {
      console.error('Error posting announcement:', err);
      alert('An error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostClick = () => {
    if (isAdmin) {
      setShowForm((prev) => !prev);
      setShowAdminPrompt(false);
      return;
    }

    setShowAdminPrompt(true);
    setShowForm(false);
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-white">
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-auto md:aspect-[16/5] min-h-[320px] md:min-h-0 flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="/pexels-pavel-danilyuk-7944238.jpg"
            alt="Alumni and Friends"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-0 text-center z-10">
          <p
            className="text-[10px] md:text-[12px] uppercase tracking-[0.25em] md:tracking-[0.35em] text-white/60 mb-4"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Community
          </p>

          <h1
            className="text-[32px] sm:text-[40px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Alumni + Friends
          </h1>

          <p className="max-w-3xl mx-auto text-white/70 mt-6 text-[15px] md:text-[18px] leading-relaxed">
            Share updates, opportunities, and stories with our community
          </p>
        </div>
      </section>

      <section className="relative w-full overflow-visible">
        <div className="flex w-full items-start gap-0">
          <TopPageNav />
          <div className="flex-1 min-w-0 w-full px-4 md:px-8 py-12">
            <div className="mx-auto max-w-[1400px]">
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.24em] text-black/40 mb-2">Announcements</p>
                  <h2 className="text-[25px] md:text-[42px] font-semibold text-black" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Community Updates
                  </h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePostClick}
                    className="bg-black text-white hover:bg-gray-800 w-42 md:w-auto"
                  >
                    {isAdmin && showForm ? 'Cancel' : '+ Post Announcement'}
                  </Button>
                  {isAdmin ? (
                    <Button variant="outline" onClick={handleLogout} className="w-28 md:w-auto">
                      Logout
                    </Button>
                  ) : (
                    <Button onClick={() => setShowAdminPrompt((prev) => !prev)} className="bg-black text-white hover:bg-gray-800 w-40 md:w-auto">
                      {showAdminPrompt ? 'Hide Login' : 'Admin Login'}
                    </Button>
                  )}
                </div>
              </div>

              {showAdminPrompt && !isAdmin && (
                <Card className="p-6 mb-8 border border-black/10">
                  <p className="text-sm text-black/70 mb-4">
                    Community updates are posted from this browser only. Sign in with the admin account to unlock posting.
                  </p>
                  <form onSubmit={handleLogin} className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="adminEmail" className="block text-sm font-medium mb-2">
                        Admin Email
                      </label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="haseebmine24@gmail.com"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="adminPassword" className="block text-sm font-medium mb-2">
                        Admin Password
                      </label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <Button type="submit" className="bg-black text-white hover:bg-gray-800">
                        Sign in as admin
                      </Button>
                      {authError && <p className="text-sm text-red-600">{authError}</p>}
                    </div>
                  </form>
                </Card>
              )}

              {showForm && isAdmin && (
                <Card className="p-8 mb-10">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium mb-2">
                        Title *
                      </label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Announcement title"
                        required
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label htmlFor="content" className="block text-sm font-medium mb-2">
                        Content *
                      </label>
                      <Textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Share your announcement..."
                        required
                        className="w-full min-h-[150px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="authorName" className="block text-sm font-medium mb-2">
                          Your Name *
                        </label>
                        <Input
                          id="authorName"
                          name="authorName"
                          value={formData.authorName}
                          onChange={handleChange}
                          placeholder="Your name"
                          required
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label htmlFor="authorEmail" className="block text-sm font-medium mb-2">
                          Your Email *
                        </label>
                        <Input
                          id="authorEmail"
                          name="authorEmail"
                          type="email"
                          value={formData.authorEmail}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                          className="w-full"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={submitting} className="bg-black text-white hover:bg-gray-800">
                        {submitting ? 'Posting...' : 'Post Announcement'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {loading ? (
                <div className="py-20 text-center text-black/50">Loading announcements...</div>
              ) : announcements.length === 0 ? (
                <div className="py-20 text-center text-black/60">
                  No announcements yet. Be the first to share!
                </div>
              ) : (
                <div className="space-y-6">
                  {announcements.map((announcement) => (
                    <Card key={announcement._id} className="p-6 border border-black/10">
                      <h3 className="text-[20px] font-semibold text-black mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {announcement.title}
                      </h3>
                      <p className="text-[14px] text-black/50 mb-4">
                        by {announcement.authorName} • {new Date(announcement.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[15px] text-black/80 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}