import { useLocation, useNavigate } from 'react-router-dom';

const navItems = ['Highlights', 'Research', 'About', 'Projects', 'Solutions', 'Products', 'Academia Outreach', 'Contact'] as const;

const routes: Record<string, string> = {
  Highlights: '/',
  Research: '/research',
  About: '/about',
  Projects: '/support-media-lab',
  Solutions: '/solutions',
  Products: '/360-vr-tour',
  'Academia Outreach': '/mas-graduate-program',
  Contact: '/contact',
};

export function TopPageNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const activeSection = navItems.find((item) => routes[item] === location.pathname)?.toString() ?? 'Highlights';

  return (
    <div className="relative z-40 bg-white/60 backdrop-blur-lg border-b border-black/5">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8 lg:px-12">
        <div className="flex min-w-0 flex-wrap md:flex-nowrap gap-2 md:gap-8 justify-center py-3 whitespace-normal">
          {navItems.map((nav) => (
            <button
              key={nav}
              onClick={() => navigate(routes[nav] || '/')}
              className={`px-0 py-2 text-[13px] md:text-[14px] font-semibold transition-colors border-b-2 ${
                activeSection === nav
                  ? 'text-[#E91E63] border-[#E91E63]'
                  : 'text-black/60 border-transparent hover:text-black'
              }`}
            >
              {nav}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
