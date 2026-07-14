import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = React.memo(function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('Highlights');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('[data-hero-section]');
      if (!heroSection) {
        setScrollProgress(0);
        return;
      }

      const rect = heroSection.getBoundingClientRect();
      const heroHeight = heroSection.offsetHeight || window.innerHeight;
      const progress = Math.max(
        0,
        Math.min(
          1,
          (window.innerHeight * 0.62 - rect.bottom) / Math.max(1, heroHeight * 0.68)
        )
      );
      setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [location.pathname]);

  const sections = [
    'Highlights',
    'Research',
    'About',
    'Projects',
    'Solutions',
    'Products',
    'Academia Outreach',
    'Contact',
  ];

  const routeMap: Record<string, string> = {
    Highlights: '/',
    Research: '/research',
    About: '/about',
    Projects: '/support-media-lab',
    Solutions: '/solutions',
    Products: '/360-vr-tour',
    'Academia Outreach': '/mas-graduate-program',
    Contact: '/contact',
  };

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      setActiveSection('Highlights');
    } else if (currentPath.startsWith('/research') || currentPath.startsWith('/projects')) {
      setActiveSection('Research');
    } else if (currentPath === '/about') {
      setActiveSection('About');
    } else if (currentPath === '/support-media-lab') {
      setActiveSection('Projects');
    } else if (currentPath === '/mas-graduate-program') {
      setActiveSection('Academia Outreach');
    } else if (currentPath === '/add-research-project') {
      setActiveSection('Add Research Project');
    }
  }, [location.pathname]);

  const navOffset = Math.max(0, Math.min(1, scrollProgress));
  const initialTop = 140;
  const topPosition = Math.max(96, initialTop - navOffset * 28);

  return (
    <div className="hidden lg:block w-80 shrink-0 self-start">
      <div
        className="sticky overflow-hidden border-r border-black/10 bg-white"
        style={{
          top: `${topPosition}px`,
          height: 'fit-content',
          maxHeight: 'calc(100vh - 64px)',
          opacity: Math.max(0, 1 - navOffset * 0.75),
          transform: `translateY(${navOffset * -18}px)`,
          transition: 'top 0.18s ease-out, opacity 0.18s ease-out, transform 0.18s ease-out',
        }}
      >
        <nav className="py-4 flex flex-col justify-between">
          <div className="space-y-0">
            {sections.map((section) => (
              <button
                key={section}
                onClick={() => {
                  setActiveSection(section);
                  navigate(routeMap[section] || '/');
                }}
                className={`w-full text-left px-6 pl-8 py-2 text-[13px] leading-5 transition-colors font-bold ${
                  activeSection === section
                    ? 'text-[#E91E63]'
                    : 'text-black hover:text-black'
                }`}
                style={{
                  fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                  fontWeight: 700,
                }}
              >
                {section}
              </button>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-black/10">
            <div className="flex gap-3 text-black/40 justify-start">
              <a href="#" className="text-[11px] hover:text-black transition-colors">X</a>
              <a href="#" className="text-[11px] hover:text-black transition-colors">FB</a>
              <a href="#" className="text-[11px] hover:text-black transition-colors">IG</a>
              <a href="#" className="text-[11px] hover:text-black transition-colors">YT</a>
              <a href="#" className="text-[11px] hover:text-black transition-colors">RSS</a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
});