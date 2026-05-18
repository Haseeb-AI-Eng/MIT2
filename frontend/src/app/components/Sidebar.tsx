import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Sidebar = React.memo(function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('News + Updates');
  const [heroPassed, setHeroPassed] = useState(false);
  const [topOffset, setTopOffset] = useState('50vh');

  useEffect(() => {
    const heroSection = document.querySelector('[data-hero-section]');
    if (!heroSection) {
      // Fallback: assume hero is passed if scrolled > 100
      const handleScroll = () => setHeroPassed(window.scrollY > 100);
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroPassed(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (heroPassed) {
      setTopOffset('64px'); // Stick below header
    } else {
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const initialTop = window.innerHeight * 0.5;
        const offset = Math.max(64, initialTop - scrollY);
        setTopOffset(`${offset}px`);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll, { passive: true });
      handleScroll();
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, [heroPassed, location.pathname]);

  const sections = [
    'News + Updates',
    'Research',
    'About',
    'Support the Media Lab',
    'EL Graduate Program',
    'People',
    'Alumni + Friends',
    'Events',
    'Add Research Project',
  ];

  const routeMap: Record<string, string> = {
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

  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/') {
      setActiveSection('News + Updates');
    } else if (currentPath.startsWith('/research') || currentPath.startsWith('/projects')) {
      setActiveSection('Research');
    } else if (currentPath === '/about') {
      setActiveSection('About');
    } else if (currentPath === '/support-media-lab') {
      setActiveSection('Support the Media Lab');
    } else if (currentPath === '/mas-graduate-program') {
      setActiveSection('EL Graduate Program');
    } else if (currentPath === '/people') {
      setActiveSection('People');
    } else if (currentPath === '/alumni-friends') {
      setActiveSection('Alumni + Friends');
    } else if (currentPath === '/add-research-project') {
      setActiveSection('Add Research Project');
    }
  }, [location.pathname]);

  return (
    <aside
      className="fixed left-0 w-80 bg-white border-r border-black/10 hidden lg:block overflow-hidden will-change-[top]"
      style={{
        top: topOffset,
        height: 'auto',
        bottom: 'auto',
        zIndex: 40,
        transition: 'top 0.15s ease-out',
      }}
    >
      <nav className="py-4 flex flex-col justify-between" style={{ minHeight: '100%' }}>
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
                fontFamily: "'Georgia', 'Garamond', serif",
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
    </aside>
  );
});