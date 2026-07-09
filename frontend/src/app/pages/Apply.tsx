import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { getApiUrl, clientCacheInvalidate } from '../api';

// Same nav items + route map as Home.tsx, so the sidebar behaves identically
// across pages. If you add/rename a section in Home.tsx, mirror it here too
// (or better: pull this into a shared component — see note at bottom of file).
const NAV_SECTIONS = [
  'News + Updates', 'Research', 'About', 'Support the Media Lab',
  'EL Graduate Program', 'People', 'Alumni + Friends', 'Events', 'Add Research Project'
];

const ROUTE_MAP: Record<string, string> = {
  'News + Updates': '/',
  Research: '/research',
  Projects: '/projects',
  About: '/about',
  'Support the Media Lab': '/support-media-lab',
  'EL Graduate Program': '/mas-graduate-program',
  People: '/people',
  'Alumni + Friends': '/alumni-friends',
  Events: '/',
  'Add Research Project': '/add-research-project',
};

export function Apply() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    id: '',
    university: '',
    program: '',
    qualifications: '',
    experience: '',
    motivation: '',
    otherInfo: '',
    projectId: ''
  });

  useEffect(() => {
    clientCacheInvalidate('published-projects:');
    const controller = new AbortController();
    const base = getApiUrl();

    async function loadProjects() {
      const endpoints = [
        `${base}/projects/fast?status=published&limit=100&page=1`,
        `${base}/projects?status=published&limit=100&page=1`,
        `${base}/projects?limit=100&page=1`,
      ];

      for (const url of endpoints) {
        try {
          console.log('[Apply] Trying:', url);

          const res = await Promise.race([
            fetch(url, { signal: controller.signal }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 6000)
            ),
          ]);

          if (!res.ok) {
            console.warn('[Apply] Non-ok status from:', url, res.status);
            continue;
          }

          const data = await res.json();
          console.log('[Apply] Response from:', url, data);

          const list =
            data?.projects ||
            data?.data ||
            (Array.isArray(data) ? data : []);

          if (list.length > 0) {
            setProjects(list);
            return;
          }

          console.warn('[Apply] Empty list from:', url);
        } catch (err: any) {
          if (err.name === 'AbortError') return;
          console.warn('[Apply] Failed/timed out:', url, err.message);
        }
      }

      console.error('[Apply] All endpoints failed or returned empty');
    }

    loadProjects().finally(() => setProjectsLoading(false));

    return () => controller.abort();
  }, []);

  const renderHero = () => (
    <section data-hero-section className="relative overflow-hidden bg-black text-white min-h-[380px] sm:min-h-0 sm:aspect-[16/5] flex items-center justify-center">
      <img
        src="/image.gif"
        alt="Apply hero"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-black/50" />
      <h1 className="relative text-[36px] md:text-[56px] text-center px-8 leading-tight font-semibold">
        Apply as a Student
      </h1>
    </section>
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.email || !formData.phone || !formData.id) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${getApiUrl()}/form-submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setSubmitted(true);
      setFormData({
        name: '', email: '', phone: '', id: '',
        university: '', program: '', qualifications: '',
        experience: '', motivation: '', otherInfo: '',
        projectId: ''
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => setFormData({
    name: '', email: '', phone: '', id: '',
    university: '', program: '', qualifications: '',
    experience: '', motivation: '', otherInfo: '',
    projectId: ''
  });

  // ── Shared sidebar, matching Home.tsx exactly ──────────────────────────
  // Key details copied from Home.tsx's <aside>: it lives in the grid row
  // that starts BELOW the hero (the hero is its own full-width section, not
  // part of this grid), then -mt-[140px] + sticky top-[140px] pulls it up
  // to tuck under the hero visually without covering the fixed site header.
  const sidebar = (
    <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 relative z-50 -mt-[125px] border-r border-black/10 self-stretch bg-white">
      <div className="sticky top-[125px] z-20 bg-white">
        <nav className="py-4">
          <div className="space-y-0">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => navigate(ROUTE_MAP[section] || '/')}
                className={`w-full text-left px-6 pl-8 py-2 text-[13px] leading-5 transition-colors font-bold ${
                  section === 'EL Graduate Program'
                    ? 'text-[#E91E63]'
                    : 'text-black hover:text-black'
                }`}
                style={{
                  fontFamily: "'Georgia', 'Garamond', serif",
                  fontWeight: 700,
                }}
              >
                {section}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );

  const pageBody = submitted ? (
    <div>
      <div className="px-4 md:px-8 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-gray-800" />
          </div>
          <h1 className="text-3xl font-semibold text-black mb-4">Application Submitted!</h1>
          <p className="text-black/70 mb-6">
            Thank you for your application. We have received your information and will review it shortly. You will be contacted via email if selected.
          </p>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <div className="px-4 md:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold text-black mb-4">Application Form</h2>
            <p className="text-base text-black/70">
              Apply to our EI Arts and Sciences Graduate Program. Please provide accurate information as this will be used for your application review.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <p className="text-gray-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 p-8 shadow-sm">

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 pb-2 border-b border-gray-100">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-black font-medium">
                    Full Name <span className="text-gray-400">*</span>
                  </Label>
                  <Input
                    id="name" name="name" value={formData.name}
                    onChange={handleChange} placeholder="Enter your full name"
                    required className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-black font-medium">
                    Email Address <span className="text-gray-400">*</span>
                  </Label>
                  <Input
                    id="email" name="email" type="email" value={formData.email}
                    onChange={handleChange} placeholder="your.email@example.com"
                    required className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-black font-medium">
                    Phone Number <span className="text-gray-400">*</span>
                  </Label>
                  <Input
                    id="phone" name="phone" value={formData.phone}
                    onChange={handleChange} placeholder="+1 (555) 123-4567"
                    required className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="id" className="text-black font-medium">
                    ID/Passport Number <span className="text-gray-400">*</span>
                  </Label>
                  <Input
                    id="id" name="id" value={formData.id}
                    onChange={handleChange} placeholder="Your ID or passport number"
                    required className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Project Selection */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 pb-2 border-b border-gray-100">Research Interest</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectId" className="text-black font-medium">Research Project Selection</Label>
                  <select
                    id="projectId" name="projectId" value={formData.projectId}
                    onChange={handleChange}
                    disabled={projectsLoading}
                    className="mt-2 flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {projectsLoading ? (
                      <option value="">Loading projects...</option>
                    ) : projects.length === 0 ? (
                      <option value="">No projects available</option>
                    ) : (
                      <>
                        <option value="">Select a research project (Optional)</option>
                        {projects.map((project) => (
                          <option key={project._id} value={project._id}>
                            {project.title}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <p className="text-xs text-black/50 mt-2">
                    {projectsLoading
                      ? 'Fetching available projects...'
                      : projects.length > 0
                        ? `${projects.length} project(s) available. Selecting one helps route your application.`
                        : 'No projects currently available.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 pb-2 border-b border-gray-100">Education</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="university" className="text-black font-medium">Current/Previous University</Label>
                  <Input
                    id="university" name="university" value={formData.university}
                    onChange={handleChange} placeholder="University name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="program" className="text-black font-medium">Program/Degree</Label>
                  <Input
                    id="program" name="program" value={formData.program}
                    onChange={handleChange} placeholder="e.g., Bachelor of Science in Computer Science"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="qualifications" className="text-black font-medium">Qualifications &amp; Skills</Label>
                  <Textarea
                    id="qualifications" name="qualifications" value={formData.qualifications}
                    onChange={handleChange}
                    placeholder="Describe your relevant qualifications, skills, and achievements"
                    className="mt-2 min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 pb-2 border-b border-gray-100">Experience</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="experience" className="text-black font-medium">Professional/Research Experience</Label>
                  <Textarea
                    id="experience" name="experience" value={formData.experience}
                    onChange={handleChange}
                    placeholder="Describe your work experience, internships, research projects, etc."
                    className="mt-2 min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="motivation" className="text-black font-medium">Motivation &amp; Interest</Label>
                  <Textarea
                    id="motivation" name="motivation" value={formData.motivation}
                    onChange={handleChange}
                    placeholder="Tell us why you're interested in EI Arts and Sciences and what you hope to achieve"
                    className="mt-2 min-h-24"
                  />
                </div>
              </div>
            </div>

            {/* Additional */}
            <div>
              <h2 className="text-xl font-semibold text-black mb-4 pb-2 border-b border-gray-100">Additional Information</h2>
              <div>
                <Label htmlFor="otherInfo" className="text-black font-medium">Other Information</Label>
                <Textarea
                  id="otherInfo" name="otherInfo" value={formData.otherInfo}
                  onChange={handleChange}
                  placeholder="Any other information you'd like us to know about you"
                  className="mt-2 min-h-20"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="bg-black hover:bg-gray-900 text-white px-8 py-3 font-semibold"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-gray-300 text-black hover:bg-gray-50"
                onClick={clearForm}
              >
                Clear
              </Button>
            </div>

            <p className="text-sm text-black/50">
              <span className="text-gray-500">*</span> Required fields
            </p>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-x-hidden w-full">
      {renderHero()}
      <section className="relative w-full z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 w-full bg-white relative">
          {sidebar}
          <div className="lg:col-start-2 lg:col-span-3 min-w-0">
            {pageBody}
          </div>
        </div>
      </section>
    </div>
  );
}

// NOTE: This sidebar block is now duplicated in both Home.tsx and Apply.tsx.
// If your other pages (Research, About, People, etc.) also need the same
// nav, it's worth pulling NAV_SECTIONS/ROUTE_MAP/sidebar JSX into a shared
// `SiteSidebar.tsx` component and wrapping routes with it in your router,
// instead of copy-pasting into every page file. Happy to do that refactor
// if you want — just share your router/App.tsx file.