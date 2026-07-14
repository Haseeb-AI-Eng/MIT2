import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  'Highlights',
  'Research',
  'About',
  'Projects',
  'Academia Outreach',
  'Solutions',
  'Products',
  'Add Research Project',
] as const;

const routeMap: Record<string, string> = {
  Highlights: '/',
  Research: '/research',
  About: '/about',
  Projects: '/support-media-lab',
  'Academia Outreach': '/mas-graduate-program',
  Solutions: '/solutions',
  Products: '/360-vr-tour',
  'Add Research Project': '/add-research-project',
};

export function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = React.useMemo(() => {
    const currentPath = location.pathname;
    const match = Object.entries(routeMap).find(([, path]) => path === currentPath);
    return match?.[0] ?? 'Highlights';
  }, [location.pathname]);

  return (
    <aside className="hidden lg:block w-80 shrink-0 relative z-30 -mt-[100px]">
      <div className="sticky top-[140px] z-20 bg-white">
        <nav className="py-4">
          <div className="space-y-0">
            {navItems.map((section) => (
              <button
                key={section}
                onClick={() => navigate(routeMap[section] || '/')}
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
        </nav>
      </div>
    </aside>
  );
}
