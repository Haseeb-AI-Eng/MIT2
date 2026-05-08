import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('News + Updates');
  const [topOffset, setTopOffset] = useState('55vh');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.35;
      const footerEl = document.querySelector('footer');
      const footerTop = footerEl ? footerEl.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight;
      const sidebarBottom = window.innerHeight - 73; // space for content below sidebar
      
      if (scrollY <= 150) {
        setTopOffset('55vh');
      } else if (scrollY < heroHeight) {
        const progress = (scrollY - 150) / (heroHeight - 150);
        const vh55 = window.innerHeight * 0.55;
        const newTop = vh55 - (vh55 - 73) * progress;
        setTopOffset(`${Math.max(73, newTop)}px`);
      } else {
        setTopOffset('73px');
      }
      
      // Adjust sidebar height to stop before footer
      const sidebar = document.querySelector('aside');
      if (sidebar) {
        const distanceToFooter = footerTop - scrollY - 73;
        if (distanceToFooter > 0) {
          (sidebar as HTMLElement).style.maxHeight = `${Math.min(distanceToFooter, window.innerHeight)}px`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const sections = [
    'News + Updates',
    'Research',
    'About',
    'Support the Media Lab',
    'EL Graduate Program',
    'People',
    'Alumni + Friends',
    'Events',
    'For Press + Media'
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
    'For Press + Media': '/',
  };

  // Update active section based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Determine which section should be active based on current path
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
    }
  }, [location.pathname]);

  return (
    <aside
      className="fixed left-0 w-80 bg-white border-r border-black/10 hidden lg:block z-40 overflow-hidden"
      style={{ top: topOffset, height: 'auto', bottom: 'auto' }}
    >
      <nav className="py-4 flex flex-col justify-between" style={{ minHeight: '100%' }}>
        <div className="space-y-1">
          {sections.map((section, index) => (
            <button
              key={section}
              onClick={() => {
                setActiveSection(section);
                navigate(routeMap[section] || '/');
              }}
              className={`w-full text-left px-6 py-2 text-[14px] leading-5 transition-colors font-sans font-semibold ${
                activeSection === section
                  ? 'text-red-500 bg-red-50'
                  : 'text-black/70 hover:text-black hover:bg-black/5'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-black/10">
          <div className="flex gap-3 text-black/40">
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
}
