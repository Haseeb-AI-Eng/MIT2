import { Link, useNavigate } from 'react-router-dom';

export function Footer() {
  const navigate = useNavigate();

  const routeMap: Record<string, string> = {
    'News + Updates': '/',
    'Research': '/research',
    'About': '/about',
    'Support the Media Lab': '/support-media-lab',
    'EL Graduate Program': '/mas-graduate-program',
    'People': '/people',
    'Events': '/',
    'Member Portal': '/',
    'For Press + Media': '/',
    'Publications': '/',
    'Contact': '/',
    'Accessibility': '/',
    'Donate to the Lab': '/support-media-lab'
  };

  const handleNavigate = (linkName: string) => {
    const route = routeMap[linkName] || '/';
    navigate(route);
  };
  return (
    <footer className="relative z-50 bg-[#f0f0f0] py-16 px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1">
          <div className="flex flex-col items-start">
            <Link
              to="/"
              className="flex flex-col items-start group transition-opacity hover:opacity-80"
              aria-label="Home"
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 72 72"
                className="text-black mb-4 transition-transform group-hover:scale-105"
              >
                <path
                  d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z"
                  fill="currentColor"
                />
                <text
                  x="36"
                  y="48"
                  fontSize="32"
                  fontWeight="bold"
                  fill="currentColor"
                  fontFamily="monospace"
                >
                  EI
                </text>
              </svg>

              <span
                className="text-[56px] font-bold tracking-tight text-black"
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                &gt; 30
              </span>
            </Link>
          </div>
          <nav className="flex flex-col gap-3">
            {['News + Updates', 'Research', 'About', 'Support the Media Lab', 'EL Graduate Program', 'People', 'Events', 'Member Portal', 'For Press + Media'].map((link) => (
              <button key={link} onClick={() => handleNavigate(link)} className="text-left text-[14px] text-black/80 hover:text-black transition-colors cursor-pointer">{link}</button>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-semibold text-black/50 mb-1">More ways to explore</span>
            {['Publications', 'Contact'].map((link) => (
              <button key={link} onClick={() => handleNavigate(link)} className="text-left text-[14px] text-black/80 hover:text-black transition-colors cursor-pointer">{link}</button>
            ))}
            <Link to="/add-research-project" className="text-[14px] text-black/80 hover:text-black transition-colors font-semibold">+ Add Research Project</Link>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-4">
          <div className="flex gap-4 text-black">
            <button onClick={() => handleNavigate('X')} className="hover:text-black/60 transition-colors cursor-pointer">X</button>
            <button onClick={() => handleNavigate('FB')} className="hover:text-black/60 transition-colors cursor-pointer">FB</button>
            <button onClick={() => handleNavigate('IG')} className="hover:text-black/60 transition-colors cursor-pointer">IG</button>
            <button onClick={() => handleNavigate('YT')} className="hover:text-black/60 transition-colors cursor-pointer">YT</button>
            <button onClick={() => handleNavigate('RSS')} className="hover:text-black/60 transition-colors cursor-pointer">RSS</button>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Home"
          >
            <svg width="50" height="32" viewBox="0 0 80 50" className="text-black">
              <text
                x="50%"
                y="58%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="42"
                fontWeight="900"
                fill="currentColor"
                fontFamily="sans-serif"
                letterSpacing="1"
              >
                EI
              </text>
            </svg>
          </Link>
          <div className="text-right lg:text-left">
            <p className="text-[13px] text-black/70">Elements Interactive Institute of Technology</p>
            <p className="text-[13px] text-black/70">School of Architecture + Planning</p>
          </div>
          <div className="flex flex-col gap-1">
            <button onClick={() => handleNavigate('Accessibility')} className="text-left text-[13px] text-black/70 hover:text-black transition-colors cursor-pointer">Accessibility</button>
            <button onClick={() => handleNavigate('Donate to the Lab')} className="text-left text-[13px] text-black/70 hover:text-black transition-colors cursor-pointer">Donate to the Lab</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
