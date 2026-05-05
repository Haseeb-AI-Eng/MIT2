import { useState, useEffect } from 'react';
import { Search, User, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SearchPanel } from './SearchPanel';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white' : 'bg-transparent'}`}>
        <div className={`px-6 flex items-center justify-between border-b transition-all duration-300 ${isScrolled ? 'border-black/10 py-4' : 'border-transparent pt-12 pb-4'}`}>
          <Link to="/" className="flex items-center gap-3">
            {/* Pixelated MIT Media Lab Logo */}
            <div className={`flex items-center gap-2 transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
              <svg width={isScrolled ? '56' : '72'} height={isScrolled ? '56' : '72'} viewBox="0 0 72 72" className={`transition-all duration-300 ${isScrolled ? 'text-black' : 'text-white'}`}>
                <path d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z" fill="currentColor" />
                <text x="36" y="30" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="0">mit</text>
                <text x="36" y="46" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="0">media</text>
                <text x="36" y="62" fontSize="16" fontWeight="bold" fill="currentColor" fontFamily="monospace" letterSpacing="0">lab</text>
              </svg>
              <span className={`font-bold tracking-tight transition-all duration-300 ${isScrolled ? 'text-black text-[44px]' : 'text-white text-[64px]'}`} style={{ fontFamily: "'Courier New', monospace" }}>
                &gt; 40
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
              <User className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button className={`p-2.5 rounded-full transition-colors ${isScrolled ? 'hover:bg-black/5 text-black' : 'hover:bg-white/10 text-white'}`}>
              <Menu className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <svg width={isScrolled ? '50' : '60'} height={isScrolled ? '50' : '60'} viewBox="0 0 80 50" className={`transition-all duration-300 ${isScrolled ? 'text-black' : 'text-white'}`}>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize="42" fontWeight="900" fill="currentColor" fontFamily="sans-serif" letterSpacing="1">MIT</text>
            </svg>
          </div>
        </div>
      </header>

      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
