import { useState } from 'react';
import { HeroVideo } from './HeroVideo';
import { TopPageNav } from '../components/TopPageNav';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-auto md:aspect-[16/5] min-h-[40vh] md:min-h-0 flex items-center">
        <div className="absolute inset-0">
          <HeroVideo src="/hero-animation.mp4" />
        </div>

        {/* Content Layer */}
        <div className="relative mx-auto max-w-[1200px] px-6 py-16 md:py-0 w-full flex flex-col items-center justify-center text-center min-h-[400px] md:min-h-[500px]">
          <h1 className="text-[32px] sm:text-[42px] md:text-[56px] font-semibold leading-tight md:leading-[1.05] max-w-4xl mx-auto">
            Get in Touch
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[14px] md:text-[16px] text-white/70 leading-relaxed">
            Have questions or want to collaborate? We'd love to hear from you. Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      <TopPageNav />

      {/* Contact Section */}
      <section className="relative w-full overflow-visible py-16 md:py-24">
        <div className="mx-auto max-w-[1000px] px-6 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-[24px] md:text-[32px] font-semibold text-black mb-6">Contact Information</h2>
                <p className="text-[14px] md:text-[16px] text-black/70 leading-relaxed mb-8">
                  Reach out to us through any of the following channels. We respond to inquiries within 24-48 hours.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">For Info Email</p>
                  <a href="mailto:info@elementsinteractive.pk" className="text-[16px] text-black hover:text-[#E91E63] transition-colors font-semibold">
                    info@elementsinteractive.pk
                  </a>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">For Talent Registration</p>
                  <a href="mailto:talent@elementsinteractive.pk" className="text-[16px] text-black hover:text-[#E91E63] transition-colors font-semibold">
                    talent@elementsinteractive.pk
                  </a>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">For Job Openings</p>
                  <a href="mailto:hr@elementsinteractive.pk" className="text-[16px] text-black hover:text-[#E91E63] transition-colors font-semibold">
                    hr@elementsinteractive.pk
                  </a>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">Phone number</p>
                  <a href="tel:+92512099274" className="text-[16px] text-black hover:text-[#E91E63] transition-colors font-semibold">
                    0092 51 2099274
                  </a>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">Whatsapp number</p>
                  <a href="https://wa.me/923349393264" className="text-[16px] text-black hover:text-[#E91E63] transition-colors font-semibold">
                    0092 3349393264
                  </a>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">Address (Pakistan)</p>
                  <p className="text-[16px] text-black">
                    Elements Interactive<br />
                    M-13, 2nd Floor, Emirates Tower, F-7 Markaz<br />
                    Islamabad<br />
                    Pakistan
                  </p>
                </div>

                <div>
                  <p className="text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">Office Hours</p>
                  <p className="text-[16px] text-black">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday & Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-black/10 rounded-none focus:outline-none focus:border-[#E91E63] transition-colors bg-white"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-black/10 rounded-none focus:outline-none focus:border-[#E91E63] transition-colors bg-white"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-black/10 rounded-none focus:outline-none focus:border-[#E91E63] transition-colors bg-white"
                    placeholder="+1 (234) 567-890"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-black/10 rounded-none focus:outline-none focus:border-[#E91E63] transition-colors bg-white"
                    placeholder="Inquiry subject"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-[12px] uppercase tracking-[0.2em] text-black/50 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-black/10 rounded-none focus:outline-none focus:border-[#E91E63] transition-colors resize-none bg-white"
                    placeholder="Your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-[#E91E63] text-white font-semibold rounded-none hover:bg-[#E91E63]/80 disabled:opacity-50 transition-all"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>

                {submitted && (
                  <div className="p-4 bg-green-100 border border-green-300 text-green-800 rounded-none">
                    Thank you for your message! We'll get back to you soon.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="relative w-full py-16 md:py-24 bg-[#050505] text-white">
        <div className="mx-auto max-w-[1200px] px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-[28px] md:text-[42px] font-semibold mb-4">Follow Our Work</h2>
          <p className="text-[14px] md:text-[16px] text-white/70 max-w-2xl mx-auto mb-8">
            Stay updated on our latest research, projects, and initiatives. Connect with us on social media.
          </p>
          <div className="flex justify-center gap-6">
            <a href="https://x.com/eiPakistan" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E91E63] transition-colors font-semibold">Twitter</a>
            <a href="https://www.instagram.com/elementsinteractive" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E91E63] transition-colors font-semibold">Instagram</a>
            <a href="https://www.linkedin.com/company/elements-interactive" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E91E63] transition-colors font-semibold">LinkedIn</a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#E91E63] transition-colors font-semibold">YouTube</a>
          </div>
        </div>
      </section>
    </div>
  );
}
