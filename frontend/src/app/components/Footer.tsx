import { Link, useNavigate } from 'react-router-dom';
import LogoIcon from './Logo';

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
    'Donate to the Lab': '/support-media-lab',
    '360 VR Tour': '/360-vr-tour'
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
            <Link to="/" className="flex items-center group transition-opacity hover:opacity-80" aria-label="Home">
              <div className="mb-4">
                <LogoIcon height={72} outlineColor="#000" />
              </div>
            </Link>
          </div>
          <nav className="flex flex-col gap-3">
            {['News + Updates', 'Research', 'About', 'Support the Media Lab', 'EL Graduate Program', 'People', 'Events', 'For Press + Media'].map((link) => (
              <Link key={link} to={routeMap[link] || '/'} className="text-left text-[14px] text-black/80 hover:text-black transition-colors">{link}</Link>
            ))}
          </nav>
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-semibold text-black/50 mb-1">More ways to explore</span>
            {['Publications', 'Contact', '360 VR Tour'].map((link) => (
              <Link key={link} to={routeMap[link] || '/'} className="text-left text-[14px] text-black/80 hover:text-black transition-colors">{link}</Link>
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
          <Link to="/" className="inline-flex items-center justify-center transition-transform hover:scale-105" aria-label="Home">
            <LogoIcon height={40} outlineColor="#000" />
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
