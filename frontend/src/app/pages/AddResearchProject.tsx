import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { X } from 'lucide-react';
import { getApiUrl, clientCacheInvalidate } from '../api';
import { TopPageNav } from '../components/TopPageNav';

export function AddResearchProject() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [pexelsQuery, setPexelsQuery] = useState('elements interactive');
  const [pexelsMediaType, setPexelsMediaType] = useState<'image' | 'video'>('image');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const [pexelsPage, setPexelsPage] = useState(1);
  const [pexelsTotal, setPexelsTotal] = useState(0);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState(null);
  const [selectedPexelsVideo, setSelectedPexelsVideo] = useState<any>(null);
  const PEXELS_API_KEY = (import.meta as any).env?.VITE_PEXELS_API_KEY || 'owQSKPi8JGkbR2MiYPWL27S4SK9BbGXfC10gdWBtuSpmf5BADUkD1CP0';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    lead: '',
    email: '',
    status: 'published',
    image: '',
    videoUrl: '',
    teamMembers: [{ name: '', role: '' }],
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.image) {
      alert('Please upload a project image.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          tags: formData.category ? [formData.category] : [],
          coverImage: formData.image,
          lead: formData.lead,
          email: formData.email,
          videoUrl: formData.videoUrl,
          teamMembers: formData.teamMembers.filter((member: any) => member.name.trim()),
        }),
      });
      if (!response.ok) {
        let errorMessage = 'Failed to create project';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errData = await response.json();
          errorMessage = errData.error || errorMessage;
        } else {
          errorMessage = `Server Error (${response.status}): ${response.statusText}. Please try again.`;
        }
        throw new Error(errorMessage);
      }

      clientCacheInvalidate('published-projects:');
      clientCacheInvalidate('projects:fast:');
      alert('Research project added and published successfully!');
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred. Make sure you are logged in.');
    } finally {
      setLoading(false);
    }
  };
  const isDirectVideoUrl = (url: string) => {
    return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url.trim());
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === 'videoUrl' && isDirectVideoUrl(value)) {
      setVideoPreview(value);
    }
  };
  const parsePexelsVideoId = (url: string) => {
    if (!url) return null;
    const normalized = url.trim();
    const pageMatch = normalized.match(/pexels\.com\/video\/(?:[\w-]+-)?(\d+)/);
    if (pageMatch) return pageMatch[1];
    const idMatch = normalized.match(/^(\d+)$/);
    if (idMatch) return idMatch[1];
    return null;
  };

  const handleLoadPexelsVideo = async () => {
    const url = formData.videoUrl?.trim();
    const videoId = parsePexelsVideoId(url);
    if (!videoId) {
      alert('Paste the Pexels video page URL or numeric video ID first.');
      return;
    }

    setPexelsLoading(true);
    setPexelsError(null);
    try {
      const res = await fetch(`https://api.pexels.com/videos/videos/${videoId}`, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });
      if (!res.ok) {
        throw new Error(`Pexels video lookup failed (${res.status})`);
      }
      const data = await res.json();
      const item = data.video || data;
      const videoFile = (item.video_files || []).find((file: any) => file.file_type === 'video/mp4') || item.video_files?.[0];
      if (!videoFile) {
        throw new Error('No MP4 file found for this Pexels video.');
      }
      const imageUrl = item.image || item.video_pictures?.[0]?.picture || formData.image;
      setSelectedPexelsVideo(videoFile);
      setVideoPreview(videoFile.link);
      if (imageUrl) setImagePreview(imageUrl);
      setFormData({
        ...formData,
        videoUrl: videoFile.link,
        ...(imageUrl ? { image: imageUrl } : {}),
      });
      setPexelsError(null);
      alert('Loaded the requested Pexels video. It is ready to use in the project.');
    } catch (err: any) {
      console.error('Pexels video lookup error:', err);
      setPexelsError(err?.message || 'Unable to load the Pexels video.');
    } finally {
      setPexelsLoading(false);
    }
  };

  const handleVideoUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      alert('Video is too large. Please upload a video under 100MB.');
      e.target.value = '';
      return;
    }
    setVideoUploading(true);
    const localPreview = URL.createObjectURL(file);
    setVideoPreview(localPreview);
    try {
      const formPayload = new FormData();
      formPayload.append('video', file);
      const res = await fetch(`${getApiUrl()}/upload/video`, {
        method: 'POST',
        body: formPayload,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData({ ...formData, videoUrl: data.videoUrl });
    } catch (err) {
      console.error('Video upload error:', err);
      alert('Failed to upload video. Please try again or paste a video URL below.');
      setVideoPreview(null);
      setFormData({ ...formData, videoUrl: '' });
      e.target.value = '';
    } finally {
      setVideoUploading(false);
    }
  };

  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert('Image is too large. Please upload an image under 20MB.');
      e.target.value = '';
      return;
    }
    setImageUploading(true);
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    setFormData({ ...formData, image: localPreview });
    setImageUploading(false);
  };
  const handleTeamMemberChange = (index: any, field: any, value: any) => {
    const newMembers = [...formData.teamMembers];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setFormData({ ...formData, teamMembers: newMembers });
  };
  const addTeamMember = () => {
    setFormData({ ...formData, teamMembers: [...formData.teamMembers, { name: '', role: '' }] });
  };

  const handlePexelsSearch = async (query = pexelsQuery, page = 1, append = false) => {
    if (!query.trim()) {
      setPexelsError('Please enter a search term.');
      return;
    }

    setPexelsLoading(true);
    setPexelsError(null);
    setSelectedPexelsVideo(null);

    try {
      const endpoint =
        pexelsMediaType === 'video'
          ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query.trim())}&per_page=40&page=${page}`
          : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query.trim())}&per_page=80&page=${page}`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      });

      if (!res.ok) {
        throw new Error(`Pexels search failed (${res.status})`);
      }

      const data = await res.json();
      const items = pexelsMediaType === 'video' ? data.videos || [] : data.photos || [];
      setPexelsResults((prev) => (append ? [...prev, ...items] : items));
      setPexelsPage(data.page || page);
      setPexelsTotal(data.total_results || 0);
    } catch (error: any) {
      console.error('Pexels search error:', error);
      setPexelsError(error?.message || 'Unable to load Pexels media.');
    } finally {
      setPexelsLoading(false);
    }
  };

  const handlePexelsSelect = (item: any) => {
    if (pexelsMediaType === 'video') {
      const videoFile = (item.video_files || []).find((file: any) => file.file_type === 'video/mp4') || item.video_files?.[0];
      if (!videoFile) {
        alert('Could not load the selected video file.');
        return;
      }
      const imageUrl = item.image || item.video_pictures?.[0]?.picture || formData.image;
      setSelectedPexelsVideo(videoFile);
      setVideoPreview(videoFile.link);
      if (imageUrl) {
        setImagePreview(imageUrl);
      }
      setFormData({
        ...formData,
        videoUrl: videoFile.link,
        ...(imageUrl ? { image: imageUrl } : {}),
      });
    } else {
      const imageUrl = item.src?.medium || item.src?.original || item.src?.large;
      setImagePreview(imageUrl);
      setFormData({ ...formData, image: imageUrl });
    }
  };

  useEffect(() => {
    handlePexelsSearch(pexelsQuery, 1, false);
  }, []);
  const removeTeamMember = (index: any) => {
    setFormData({ ...formData, teamMembers: formData.teamMembers.filter((member: any, i: any) => i !== index) });
  };
  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-black text-white">
        <img
          src="/image.gif"
          alt="Add research project hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-32 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4">Submit Research</p>
          <h1 className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto">
            Add New Research Project
          </h1>
          <p className="max-w-3xl mx-auto text-white/70 mt-6 text-[16px] md:text-[18px]">
            Share your research and innovations with the MIT Media Lab community
          </p>
        </div>
      </section>
      <section className="relative w-full overflow-visible">
        <TopPageNav />
        <div className="w-full px-4 md:px-8 py-12">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12">
              <p className="text-[12px] uppercase tracking-[0.24em] text-black/40 mb-2">New Project Form</p>
            </div>
            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-2">Project Title *</label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter project title" required className="w-full" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your research project" required className="w-full min-h-[150px]" />
                </div>
                {/* ── VIDEO SECTION ── */}
                <div>
                  <label htmlFor="videoUpload" className="block text-sm font-medium mb-2">
                    Project Video <span className="text-gray-400 font-normal">(max 100MB)</span>
                  </label>
                  <div className="space-y-3">
                    <Input
                      id="videoUpload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      disabled={videoUploading}
                      className="w-full"
                    />
                    <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                      <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                        Current Video Status:
                      </p>
                      {videoUploading ? (
                        <p className="text-xs text-blue-600 font-medium animate-pulse">
                          Uploading video to server…
                        </p>
                      ) : (videoPreview || (formData.videoUrl && isDirectVideoUrl(formData.videoUrl))) ? (
                        <div className="space-y-2">
                          <video
                            className="w-full max-h-48 rounded bg-black"
                            controls
                            src={videoPreview || formData.videoUrl}
                          />
                          <p className="text-[11px] text-green-600 font-medium">✓ Custom video selected successfully</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">No video selected — default video will be used</span>
                          <span className="text-[10px] bg-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase font-bold tracking-tighter">Default</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Or paste a video URL (YouTube, Vimeo, CDN link) or a Pexels video page URL:
                      </label>
                      <div className="flex gap-2">
                        <Input
                          name="videoUrl"
                          value={formData.videoUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                          className="w-full text-sm"
                        />
                        <Button
                          type="button"
                          onClick={handleLoadPexelsVideo}
                          disabled={pexelsLoading || !formData.videoUrl.trim()}
                          className="whitespace-nowrap"
                        >
                          Load Pexels
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        For a specific Pexels video, paste its page URL like:
                        <span className="block break-all">https://www.pexels.com/video/aerial-view-of-karachi-port-roundabout-traffic-38129569/</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="imageUpload" className="block text-sm font-medium mb-2">
                    Project Image (upload from system)
                  </label>
                  <Input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={imageUploading}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    If you prefer to upload an image from your computer instead of selecting one from Pexels, use this field.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">Category *</label>
                    <select id="category" name="category" value={formData.category} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="">Select a category</option>
                      <option value="AI">AI & Machine Learning</option>
                      <option value="HCI">Human-Computer Interaction</option>
                      <option value="Media">Media Technology</option>
                      <option value="Biology">Synthetic Biology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2">Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="published">Published</option>
                      <option value="review">Under Review</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="lead" className="block text-sm font-medium mb-2">Project Lead *</label>
                    <Input id="lead" name="lead" value={formData.lead} onChange={handleChange} placeholder="Your name" required className="w-full" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">Lead Email *</label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="your.email@mit.edu" required className="w-full" />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <div>
                  <label htmlFor="pexelsSearch" className="block text-sm font-medium mb-2">
                    Project Image * <span className="text-gray-400 font-normal">(choose from Pexels)</span>
                  </label>
                  <div className="space-y-4">
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Input
                        id="pexelsSearch"
                        name="pexelsSearch"
                        value={pexelsQuery}
                        onChange={(e) => setPexelsQuery(e.target.value)}
                        placeholder="Search Pexels media"
                        className="flex-1"
                      />
                      <div className="flex gap-2">
                        <select
                          value={pexelsMediaType}
                          onChange={(e) => setPexelsMediaType(e.target.value as 'image' | 'video')}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="image">Images</option>
                          <option value="video">Videos</option>
                        </select>
                        <Button type="button" onClick={() => handlePexelsSearch(pexelsQuery)} disabled={pexelsLoading}>
                          Search
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 bg-white">
                      {pexelsLoading ? (
                        <p className="text-sm text-gray-600">Loading media…</p>
                      ) : pexelsError ? (
                        <p className="text-sm text-red-600">{pexelsError}</p>
                      ) : pexelsResults.length === 0 ? (
                        <p className="text-sm text-gray-600">No media found. Try a different term.</p>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center justify-between text-xs text-gray-600">
                            <span>{pexelsTotal.toLocaleString()} results</span>
                            <span>Page {pexelsPage}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto">
                            {pexelsResults.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handlePexelsSelect(item)}
                                className="block rounded-lg overflow-hidden border transition hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {pexelsMediaType === 'video' ? (
                                  <div className="relative h-28 bg-black/5 flex items-center justify-center">
                                    <img
                                      src={item.image}
                                      alt={item.user?.name || 'Pexels video'}
                                      className="w-full h-full object-cover"
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-xl bg-black/30">
                                      ▶
                                    </span>
                                  </div>
                                ) : (
                                  <img src={item.src.medium} alt={item.alt || 'Pexels image'} className="w-full h-28 object-cover" />
                                )}
                              </button>
                            ))}
                          </div>
                          {pexelsResults.length < pexelsTotal && (
                            <div className="mt-3 text-center">
                              <Button
                                type="button"
                                onClick={() => handlePexelsSearch(pexelsQuery, pexelsPage + 1, true)}
                                disabled={pexelsLoading}
                                className="w-full"
                              >
                                Load more
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      {videoPreview ? (
                        <video
                          className="w-full h-60 object-cover bg-black"
                          controls
                          src={videoPreview}
                        />
                      ) : imagePreview ? (
                        <img src={imagePreview} alt="Selected project" className="w-full h-60 object-cover" />
                      ) : (
                        <div className="h-60 flex items-center justify-center bg-gray-50 text-gray-500">
                          Select an image from the Pexels results above.
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Images are loaded directly from Pexels. If you want specific photos from the Elements Interactive gallery, search terms like "elements interactive", "mixed reality", or "creative studio".
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Team Members ({formData.teamMembers.length})</label>
                <Button type="button" onClick={addTeamMember} className="bg-blue-600 text-white hover:bg-blue-700 text-sm">
                  + Add Member
                </Button>
              </div>
              <div className="space-y-4">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <Input value={member.name} onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)} placeholder="Team member name" className="w-full" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                      <Input value={member.role} onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)} placeholder="e.g., Researcher, Designer" className="w-full" />
                    </div>
                    {formData.teamMembers.length > 1 && (
                      <button type="button" onClick={() => removeTeamMember(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading || videoUploading} className="bg-black text-white hover:bg-gray-800">
                {loading ? 'Submitting...' : 'Submit Research Project'}
              </Button>
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
            </div>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}