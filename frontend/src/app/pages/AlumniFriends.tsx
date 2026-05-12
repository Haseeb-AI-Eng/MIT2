import { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { X } from 'lucide-react';

interface Announcement {
  _id?: string;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
}

export function AlumniFriends() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim() || !formData.authorName.trim() || !formData.authorEmail.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Announcement posted successfully!');
        setFormData({ title: '', content: '', authorName: '', authorEmail: '' });
        setShowForm(false);
        fetchAnnouncements();
      } else {
        alert('Failed to post announcement.');
      }
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero section with graduation image */}
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-[16/5] flex items-center justify-center">
        <img
          src="/pexels-pavel-danilyuk-7944238.jpg"
          alt="Alumni and Friends"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto max-w-[1200px] px-6 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            Community
          </p>
          <h1
            className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Alumni + Friends
          </h1>
          <p className="max-w-3xl mx-auto text-white/70 mt-6 text-[16px] md:text-[18px]">
            Share updates, opportunities, and stories with our community
          </p>
        </div>
      </section>

      <main className="lg:ml-80 px-4 md:px-8 py-12 max-w-[1400px] mx-auto">
        <div className="mb-10 flex justify-between items-center">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/40 mb-2">Announcements</p>
            <h2 className="text-[32px] md:text-[42px] font-semibold text-black" style={{ fontFamily: 'Georgia, serif' }}>
              Community Updates
            </h2>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white hover:bg-gray-800"
          >
            {showForm ? 'Cancel' : '+ Post Announcement'}
          </Button>
        </div>

        {showForm && (
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
                <h3 className="text-[20px] font-semibold text-black mb-2" style={{ fontFamily: 'Georgia, serif' }}>
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
      </main>
    </div>
  );
}
