import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { fetchPublishedProjects, getApiUrl } from '../api';

export function Apply() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
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
    fetchPublishedProjects(50, 1)
      .then((data) => {
        if (data && data.projects) {
          setProjects(data.projects);
        }
      })
      .catch((err) => console.error('Error fetching projects:', err));
  }, []);

  const renderHero = () => (
    <section className="relative overflow-hidden bg-black text-white aspect-[16/5] flex items-center justify-center">
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

      setTimeout(() => setSubmitted(false), 5000);
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

  if (submitted) {
    return (
      <div>
        {renderHero()}
        <div className="lg:ml-80 px-4 md:px-8 py-12 flex items-center justify-center min-h-[60vh]">
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
    );
  }

  return (
    <div>
      {renderHero()}
      <div className="lg:ml-80 px-4 md:px-8 py-12">
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
                    className="mt-2 flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a research project (Optional)</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-black/50 mt-2">Selecting a project helps us route your application to the right research lead.</p>
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
}