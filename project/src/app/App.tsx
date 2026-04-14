import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { NewsCard } from './components/NewsCard';
import { EventCard } from './components/EventCard';
import { motion } from 'motion/react';
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';


const articles = [
  {
    id: 1,
    slug: "adaptive-robotic-systems",
    title: "Adaptive robotic systems for enhanced human collaboration",
    image: "https://images.unsplash.com/photo-1578918748648-7d30d67436c2?w=800",
    category: "Research",
    shortDescription: "Researchers develop new frameworks for robots that can seamlessly integrate into human workflows and adapt to dynamic environments.",
  },
  {
    id: 2,
    slug: "gastronomy-beyond-event",
    title: "Gastronomy & Beyond: The Event (6. Edition)",
    image: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600",
    category: "Event",
    shortDescription: "April 2026 • MIT EVENT",
  },
  {
    id: 3,
    slug: "media-lab-chi-2026",
    title: "Media Lab at CHI 2026",
    image: "https://images.unsplash.com/photo-1768572019427-2ce961caaece?w=600",
    category: "News",
    shortDescription: "Members got 18 papers into CHI, the top venue for human-computer interaction research.",
  },
  {
    id: 4,
    slug: "electrically-driven-artificial-muscle-fiber",
    title: "A new type of electrically driven artificial muscle fiber",
    image: "https://images.unsplash.com/photo-1675557009875-436f71457475?w=800",
    category: "Research",
    shortDescription: "MIT researchers create fiber that contracts in response to electrical stimulation and delivers more than three times the power of natural muscle.",
  },
  {
    id: 5,
    slug: "advancing-women-in-stem",
    title: "MIT Media Lab Working to Advance Women in STEM",
    image: "https://images.unsplash.com/photo-1630959305529-67447c685b9e?w=400",
    category: "News",
    shortDescription: "",
  },
  {
    id: 6,
    slug: "design-innovations-hci",
    title: "Design innovations in human-computer interaction",
    image: "https://images.unsplash.com/photo-1773982674487-2657ef3f58c3?w=400",
    category: "Research",
    shortDescription: "",
  },
  {
    id: 7,
    slug: "portable-ultrasound-sensor",
    title: "A portable ultrasound sensor may enable earlier detection of breast cancer",
    image: "https://images.unsplash.com/photo-1754941622117-97957c5d669b?w=600",
    category: "Research",
    shortDescription: "MIT Media Lab researchers have developed a wearable ultrasound device that could allow people to detect breast tumors.",
  },
  {
    id: 8,
    slug: "smart-wearable-biomarkers",
    title: "Smart wearable detects biomarkers for early disease detection",
    image: "https://images.unsplash.com/photo-1701848053746-2ebc5ea9f801?w=600",
    category: "Research",
    shortDescription: "New sensor technology enables continuous health monitoring.",
  },
  {
    id: 9,
    slug: "world-economic-forum-2026",
    title: "The MIT Media Lab at World Economic Forum Annual Meeting 2026",
    image: "https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600",
    category: "Event",
    shortDescription: "Lab members present at global sustainability forum.",
  },
  {
    id: 10,
    slug: "vision-system-urban-robots",
    title: "Towards a vision system for urban robots",
    image: "https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?w=800",
    category: "Design",
    shortDescription: "Researchers build a new imaging pipeline to help machines see through crowded city scenes.",
  },
  {
    id: 11,
    slug: "keep-slowing-down",
    title: "Keep Slowing Down?",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
    category: "Research",
    shortDescription: "MIT Media Lab explores how our relationship with time and technology affects creative work and innovation.",
  },
  {
    id: 12,
    slug: "21st-century-tax-bill",
    title: "The 21st century tax bill, picked by the world's top fintech minds",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600",
    category: "News",
    shortDescription: "Media Lab researchers contribute to global financial innovation discussions.",
  },
  {
    id: 13,
    slug: "building-collaborative-lab-culture",
    title: "Building collaborative lab culture",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
    category: "Community",
    shortDescription: "Exploring how interdisciplinary teams create more impact through shared research goals.",
  },
  {
    id: 14,
    slug: "designing-tools-creative-inquiry",
    title: "Designing tools for creative inquiry",
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400",
    category: "Innovation",
    shortDescription: "A snapshot of how Lab members prototype future-facing technologies and systems.",
  },
  {
    id: 15,
    slug: "lifelong-kindergarten-creative-learning-lab",
    title: "Lifelong Kindergarten: Creative Learning Lab",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600",
    category: "Event",
    shortDescription: "New episodes exploring creativity, learning, and design with Mitch Resnick and guests.",
  },
  {
    id: 16,
    slug: "cross-disciplinary-research-action",
    title: "Cross-disciplinary research in action",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600",
    category: "Podcast",
    shortDescription: "Researchers collaborate across disciplines to tackle global challenges with innovative solutions.",
  },
  {
    id: 17,
    slug: "visual-interfaces-immersive-design",
    title: "Visual interfaces for immersive design",
    image: "https://images.unsplash.com/photo-1764345933933-bd14461f9f7b?w=600",
    category: "Exhibition",
    shortDescription: "A visual exploration of form, color, and the future of creative engagement.",
  },
  {
    id: 18,
    slug: "mapping-future-human-centered-ai",
    title: "Mapping the future of human-centered AI",
    image: "https://images.unsplash.com/photo-1772882971868-1bb960ebf150?w=600",
    category: "Research",
    shortDescription: "Images that highlight the role of research in shaping empathetic technology.",
  },
];

const generateFullContent = (title: string, category: string): string => {
  const intro = `This in-depth article explores ${title}, a flagship project from the MIT Media Lab in the field of ${category.toLowerCase()}. For years, interdisciplinary teams of researchers, designers, engineers, and artists have collaborated to push the boundaries of what is possible. The work addresses real-world challenges while imagining bold new futures for how humans live, work, and interact with technology.`;
  const baseParagraph = `Detailed studies and prototypes have shown remarkable results. Early testing demonstrated improvements in efficiency, user engagement, and adaptability far beyond existing solutions. Ethical considerations were placed at the center of development, ensuring the technology serves humanity responsibly. Partnerships with industry leaders, governments, and community organizations have accelerated real-world deployment.`;
  const expanded = `${intro}\n\n${baseParagraph} Researchers continue to iterate based on user feedback and emerging data. Future phases will incorporate advanced AI models, sustainable materials, and inclusive design principles. This initiative not only advances scientific knowledge but also creates tangible societal impact, from healthcare to education, urban planning to creative industries.\n\n`.repeat(8);
  return expanded + `The MIT Media Lab remains committed to open collaboration. All findings, datasets, and code are being prepared for public release to empower the global research community. This article provides a comprehensive overview of the methodology, key discoveries, challenges overcome, and the roadmap ahead. Additional sections cover technical specifications, case studies, expert interviews, and visual documentation of the prototypes in action.`;
};

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar />

      {children}

      {/* Footer - identical to original */}
      <footer className="bg-[#f0f0f0] py-16 px-8 lg:px-12">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-12">
          {/* Left: Logo + Main Nav Links */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1">
            {/* Pixel Logo */}
            <div className="flex flex-col items-start">
              <svg width="80" height="80" viewBox="0 0 72 72" className="text-black mb-4">
                <path d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z" fill="currentColor" />
                <text x="36" y="30" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">mit</text>
                <text x="36" y="46" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">media</text>
                <text x="36" y="62" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">lab</text>
              </svg>
              <span className="text-[56px] font-bold tracking-tight text-black" style={{ fontFamily: "'Courier New', monospace" }}>&gt; 40</span>
            </div>

            {/* Main Nav Links */}
            <nav className="flex flex-col gap-3">
              {['News + Updates', 'Research', 'About', 'Support the Media Lab', 'MAS Graduate Program', 'People', 'Events', 'Videos', 'Member Portal', 'For Press + Media'].map((link) => (
                <a key={link} href="#" className="text-[14px] text-black/80 hover:text-black transition-colors">{link}</a>
              ))}
            </nav>

            {/* More ways to explore */}
            <div className="flex flex-col gap-3">
              <span className="text-[14px] font-semibold text-black/50 mb-1">More ways to explore</span>
              {['Videos', 'Publications', 'Job Opportunities', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-[14px] text-black/80 hover:text-black transition-colors">{link}</a>
              ))}
            </div>
          </div>

          {/* Right: Social + MIT Info */}
          <div className="flex flex-col items-start lg:items-end gap-4">
            {/* Social Icons */}
            <div className="flex gap-4 text-black">
              <a href="#" className="hover:text-black/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="hover:text-black/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="hover:text-black/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="hover:text-black/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="#" className="hover:text-black/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141a.506.506 0 01.171.325c.016.093.036.306.02.472z"/></svg>
              </a>
            </div>

            {/* MIT Logo */}
            <svg width="50" height="32" viewBox="0 0 80 50" className="text-black">
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize="42" fontWeight="900" fill="currentColor" fontFamily="sans-serif" letterSpacing="1">MIT</text>
            </svg>

            {/* Institution Info */}
            <div className="text-right lg:text-left">
              <p className="text-[13px] text-black/70">Massachusetts Institute of Technology</p>
              <p className="text-[13px] text-black/70">School of Architecture + Planning</p>
            </div>

            {/* Bottom Links */}
            <div className="flex flex-col gap-1">
              <a href="#" className="text-[13px] text-black/70 hover:text-black transition-colors">Accessibility</a>
              <a href="#" className="text-[13px] text-black/70 hover:text-black transition-colors">Donate to the Lab</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomePage() {
  return (
    <Layout>
      <main className="">
        {/* Hero Section - unchanged */}
        <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/image.gif"
              alt=""
              className="w-full h-full object-cover opacity-60"
            />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative text-[36px] md:text-[56px] text-center px-8 leading-tight z-10"
            style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 300 }}
          >
            Imagine what we can become.
          </motion.h1>
        </section>

        {/* Content Grid - all cards now wrapped with Link to their article page */}
        <section className="lg:ml-80 px-4 md:px-8 py-8 max-w-[1400px]">
          {/* Row 1: Large image left + Event right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <Link to="/article/adaptive-robotic-systems" className="block">
              <NewsCard
                image="https://images.unsplash.com/photo-1578918748648-7d30d67436c2?w=800"
                title="Adaptive robotic systems for enhanced human collaboration"
                description="Researchers develop new frameworks for robots that can seamlessly integrate into human workflows and adapt to dynamic environments."
                category="Research"
                size="large"
              />
            </Link>
            <Link to="/article/gastronomy-beyond-event" className="block">
              <EventCard
                image="https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600"
                title="Gastronomy & Beyond: The Event (6. Edition)"
                date="April 2026"
                tag="MIT EVENT"
              />
            </Link>
          </div>

          {/* Row 2: Colorful art + Large muscle fiber article + 2 small items stacked */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
            <div className="md:col-span-4">
              <Link to="/article/media-lab-chi-2026" className="block">
                <NewsCard
                  image="https://images.unsplash.com/photo-1768572019427-2ce961caaece?w=600"
                  title="Media Lab at CHI 2026"
                  description="Members got 18 papers into CHI, the top venue for human-computer interaction research."
                  category="News"
                />
              </Link>
            </div>
            <div className="md:col-span-5">
              <Link to="/article/electrically-driven-artificial-muscle-fiber" className="block">
                <NewsCard
                  image="https://images.unsplash.com/photo-1675557009875-436f71457475?w=800"
                  title="A new type of electrically driven artificial muscle fiber"
                  description="MIT researchers create fiber that contracts in response to electrical stimulation and delivers more than three times the power of natural muscle."
                  category="Research"
                  size="large"
                />
              </Link>
            </div>
            <div className="md:col-span-3 space-y-5">
              <Link to="/article/advancing-women-in-stem" className="block">
                <NewsCard
                  image="https://images.unsplash.com/photo-1630959305529-67447c685b9e?w=400"
                  title="MIT Media Lab Working to Advance Women in STEM"
                  category="News"
                />
              </Link>
              <Link to="/article/design-innovations-hci" className="block">
                <NewsCard
                  image="https://images.unsplash.com/photo-1773982674487-2657ef3f58c3?w=400"
                  title="Design innovations in human-computer interaction"
                  category="Research"
                />
              </Link>
            </div>
          </div>

          {/* Row 3: 3 equal columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <Link to="/article/portable-ultrasound-sensor" className="block">
              <NewsCard
                image="https://images.unsplash.com/photo-1754941622117-97957c5d669b?w=600"
                title="A portable ultrasound sensor may enable earlier detection of breast cancer"
                description="MIT Media Lab researchers have developed a wearable ultrasound device that could allow people to detect breast tumors."
                category="Research"
              />
            </Link>
            <Link to="/article/smart-wearable-biomarkers" className="block">
              <NewsCard
                image="https://images.unsplash.com/photo-1701848053746-2ebc5ea9f801?w=600"
                title="Smart wearable detects biomarkers for early disease detection"
                description="New sensor technology enables continuous health monitoring."
                category="Research"
              />
            </Link>
            <Link to="/article/world-economic-forum-2026" className="block">
              <NewsCard
                image="https://images.unsplash.com/photo-1655393001768-d946c97d6fd1?w=600"
                title="The MIT Media Lab at World Economic Forum Annual Meeting 2026"
                description="Lab members present at global sustainability forum."
                category="Event"
              />
            </Link>
          </div>

          {/* Featured Section: Large image left + 2 news items right */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Left card with image */}
            <Link to="/article/vision-system-urban-robots" className="block">
              <div>
                <div className="overflow-hidden aspect-[16/10]">
                  <img
                    src="https://images.unsplash.com/photo-1494869042583-f6c911f04b4c?w=800"
                    alt="Eye"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Design</p>
                  <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Towards a vision system for urban robots</h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">Researchers build a new imaging pipeline to help machines see through crowded city scenes.</p>
                </div>
              </div>
            </Link>

            {/* Right column - two text-only cards wrapped */}
            <div className="flex flex-col justify-between">
              <Link to="/article/keep-slowing-down" className="block">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Research</p>
                  <h3 className="text-[22px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Keep Slowing Down?</h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">MIT Media Lab explores how our relationship with time and technology affects creative work and innovation.</p>
                </div>
              </Link>

              <Link to="/article/21st-century-tax-bill" className="block mt-8 pt-8 border-t border-black/10">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">News</p>
                  <h3 className="text-[22px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">The 21st century tax bill, picked by the world's top fintech minds</h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">Media Lab researchers contribute to global financial innovation discussions.</p>
                </div>
              </Link>
            </div>
          </div>

          {/* 4-Pack Section: 2 images + styled center text */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
            <Link to="/article/building-collaborative-lab-culture" className="block flex flex-col">
              <div className="overflow-hidden aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400"
                  alt="Community"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Community</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Building collaborative lab culture</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">Exploring how interdisciplinary teams create more impact through shared research goals.</p>
              </div>
            </Link>

            {/* Center promo text - left as non-clickable (not a card) */}
            <div className="col-span-2 bg-black text-white flex flex-col items-center justify-center p-12 text-center">
              <p className="text-[12px] uppercase tracking-widest text-white/50 mb-4">Media Lab</p>
              <h3 className="text-[36px] font-[300] mb-4 leading-tight">Where art meets science</h3>
              <p className="text-[14px] text-white/70 max-w-md leading-relaxed">We bring together unconventional combinations of researchers, artists, and designers to explore the future of how we live, work, and play.</p>
            </div>

            <Link to="/article/designing-tools-creative-inquiry" className="block flex flex-col">
              <div className="overflow-hidden aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400"
                  alt="Innovation"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Innovation</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Designing tools for creative inquiry</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">A snapshot of how Lab members prototype future-facing technologies and systems.</p>
              </div>
            </Link>
          </div>

          {/* 2 Images with descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <Link to="/article/lifelong-kindergarten-creative-learning-lab" className="block">
              <div>
                <div className="overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600"
                    alt="Collaboration"
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Event</p>
                <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Lifelong Kindergarten: Creative Learning Lab</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">New episodes exploring creativity, learning, and design with Mitch Resnick and guests.</p>
              </div>
            </Link>
            <Link to="/article/cross-disciplinary-research-action" className="block">
              <div>
                <div className="overflow-hidden mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600"
                    alt="Team"
                    className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Podcast</p>
                <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Cross-disciplinary research in action</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">Researchers collaborate across disciplines to tackle global challenges with innovative solutions.</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Support Section - unchanged */}
        <section className="lg:ml-80 bg-black text-white py-24 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[36px] md:text-[48px] font-[300] mb-6">
              Support the Media Lab
            </h2>
            <p className="text-[18px] text-white/80 mb-10 max-w-2xl mx-auto">
              We look to work together, not just play an important role in shaping people's better and more joyful future at MIT.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors text-[14px]">
                Corporate Membership
              </button>
              <button className="px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors text-[14px]">
                Foundations
              </button>
              <button className="px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors text-[14px]">
                Alumni + Friends
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Image Grid - wrapped clickable cards */}
        <section className="lg:ml-80 px-4 md:px-8 py-8">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            <Link to="/article/visual-interfaces-immersive-design" className="block flex flex-col break-inside-avoid">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1764345933933-bd14461f9f7b?w=600"
                  alt="Abstract art"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Exhibition</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Visual interfaces for immersive design</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">A visual exploration of form, color, and the future of creative engagement.</p>
              </div>
            </Link>
            <Link to="/article/mapping-future-human-centered-ai" className="block flex flex-col break-inside-avoid">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1772882971868-1bb960ebf150?w=600"
                  alt="Abstract art"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">Research</p>
                <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">Mapping the future of human-centered AI</h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">Images that highlight the role of research in shaping empathetic technology.</p>
              </div>
            </Link>
            <div className="aspect-square overflow-hidden bg-gray-200 break-inside-avoid"></div>
            <div className="aspect-square overflow-hidden bg-gray-100 break-inside-avoid"></div>
          </div>
        </section>

        {/* Footer Preview Section - left unchanged (not main cards) */}
        <section className="lg:ml-80 px-8 py-16 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400"
                  alt="MIT Research"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
                MIT Research is a way out design principles take ground in the 75th Massachusetts Avenue, design and build an intriguing future.
              </p>
              <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">Via MIT News, May 2, 2025</p>
            </div>
            <div>
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400"
                  alt="Innovation"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
                Program to access cutting-edge research, talent, and innovation shaping tomorrow's technologies.
              </p>
              <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">Oct. 2, 2024</p>
            </div>
            <div>
              <div className="aspect-[4/3] overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400"
                  alt="Awards"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
                View recent awards and recognitions granted to the Media Lab community.
              </p>
              <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">Jan. 1, 2023</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    return (
      <Layout>
        <main className="lg:ml-80 px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-serif">Article not found</h1>
            <p className="mt-4 text-black/60">The article you are looking for does not exist or has been moved.</p>
            <Link to="/" className="inline-block mt-8 px-6 py-3 bg-black text-white text-sm hover:bg-gray-800 transition-colors">
              Return to Home
            </Link>
          </div>
        </main>
      </Layout>
    );
  }

  const fullContent = generateFullContent(article.title, article.category);

  return (
    <Layout>
      <main className="">
        {/* Article Hero: Full image at top (no black background) with title overlaid */}
        <section className="relative aspect-[16/5] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Subtle dark overlay for text readability while still showing the full image clearly */}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center px-8 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1 text-xs uppercase tracking-[1px] bg-white/90 text-black font-medium mb-6">
                {article.category}
              </span>
              <h1
                className="text-[36px] md:text-[56px] leading-tight text-white"
                style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 300 }}
              >
                {article.title}
              </h1>
            </motion.div>
          </div>
        </section>

        {/* Detailed article content - minimum 50+ lines of rich text */}
        <section className="lg:ml-80 px-4 md:px-8 py-12 max-w-[1400px]">
          <div className="max-w-3xl mx-auto prose prose-lg font-serif">
            {fullContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-8 text-[17px] leading-relaxed text-black/80">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Article metadata footer */}
          <div className="max-w-3xl mx-auto mt-20 pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-start md:items-center text-sm">
            <div>
              <p className="text-black/40">Published April 2026 • MIT Media Lab</p>
            </div>
            <div className="flex gap-6 mt-6 md:mt-0">
              <a href="#" className="text-black/60 hover:text-black flex items-center gap-2 text-sm">
                <span>Share</span>
              </a>
              <a href="#" className="text-black/60 hover:text-black flex items-center gap-2 text-sm">
                <span>Save</span>
              </a>
              <Link to="/" className="text-black/60 hover:text-black flex items-center gap-2 text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/article/:slug" element={<ArticlePage />} />
      </Routes>
    </>
  );
}