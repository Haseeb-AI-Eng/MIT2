import { Link } from 'react-router-dom';

const mainNavLinks = [
  { name: 'News + Updates', path: '/' },
  { name: 'Research', path: '/research' },
  { name: 'About', path: '/about' },
  { name: 'Support the Media Lab', path: '/support-media-lab' },
  { name: 'MAS Graduate Program', path: '/mas-graduate-program' },
  { name: 'People', path: '/people' },
  { name: 'Events', path: '/' },
  { name: 'Videos', path: '/' },
  { name: 'Member Portal', path: '/' },
  { name: 'For Press + Media', path: '/about#press' }
];

export function Footer() {
  return (
    <footer className="bg-[#f0f0f0] py-16 px-8 lg:px-12">
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row justify-between gap-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 flex-1">
          <div className="flex flex-col items-start">
            <svg width="80" height="80" viewBox="0 0 72 72" className="text-black mb-4">
              <path d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z" fill="currentColor" />
              <text x="36" y="30" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">mit</text>
              <text x="36" y="46" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">media</text>
              <text x="36" y="62" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace">lab</text>
            </svg>
            <span className="text-[56px] font-bold tracking-tight text-black" style={{ fontFamily: "'Courier New', monospace" }}>&gt; 40</span>
          </div>
          <nav className="flex flex-col gap-3">
            {mainNavLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-[14px] text-black/80 hover:text-black transition-colors">
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-semibold text-black/50 mb-1">More ways to explore</span>
            <Link to="/" className="text-[14px] text-black/80 hover:text-black transition-colors">Videos</Link>
            <Link to="/research" className="text-[14px] text-black/80 hover:text-black transition-colors">Publications</Link>
            <Link to="/about#jobs" className="text-[14px] text-black/80 hover:text-black transition-colors">Job Opportunities</Link>
            <Link to="/about#contact" className="text-[14px] text-black/80 hover:text-black transition-colors">Contact</Link>
            <Link to="/add-research-project" className="text-[14px] text-black/80 hover:text-black transition-colors font-semibold">+ Add Research Project</Link>
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-4">
          <div className="flex gap-4 text-black">
            <a href="#" className="hover:text-black/60 transition-colors">X</a>
            <a href="#" className="hover:text-black/60 transition-colors">FB</a>
            <a href="#" className="hover:text-black/60 transition-colors">IG</a>
            <a href="#" className="hover:text-black/60 transition-colors">YT</a>
            <a href="#" className="hover:text-black/60 transition-colors">RSS</a>
          </div>
          <svg width="50" height="32" viewBox="0 0 80 50" className="text-black">
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize="42" fontWeight="900" fill="currentColor" fontFamily="sans-serif" letterSpacing="1">MIT</text>
          </svg>
          <div className="text-right lg:text-left">
            <p className="text-[13px] text-black/70">Massachusetts Institute of Technology</p>
            <p className="text-[13px] text-black/70">School of Architecture + Planning</p>
          </div>
          <div className="flex flex-col gap-1">
            <Link to="/" className="text-[13px] text-black/70 hover:text-black transition-colors">Accessibility</Link>
            <Link to="/support-media-lab" className="text-[13px] text-black/70 hover:text-black transition-colors">Donate to the Lab</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
