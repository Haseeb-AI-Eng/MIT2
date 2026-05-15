import React, { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SearchPanel } from './SearchPanel';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header = React.memo(function Header({ onMenuClick }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(() =>
    typeof window !== 'undefined' ? window.scrollY > 80 : false
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const scrollThreshold = 80; // Define a scroll threshold for pages without a specific hero section

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // The header should be hidden while hero is visible (on desktop), visible when past hero, hidden again when back up.
    // On mobile/tablet, always visible.

    // Try to find a hero section dynamically
    const heroSection = document.querySelector('[data-hero-section]');

    if (!heroSection) {
      // Fallback for pages without a data-hero-section
      const handleScroll = () => setIsScrolled(window.scrollY > scrollThreshold);
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }

    // For pages with a data-hero-section, use IntersectionObserver
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );
    observer.observe(heroSection);
    return () => observer.disconnect();
  }, [location.pathname]);

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
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-[opacity] ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
          }`}
      >
        <div
          className={`px-4 md:px-6 flex items-center justify-between border-b transition-all duration-300 ${isScrolled ? 'border-black/10 py-3' : 'border-transparent pt-6 md:pt-12 pb-2 md:pb-4'
            }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="flex items-center gap-1 md:gap-2 transition-all duration-300 h-[80px]">

              {/* Desktop SVG logo - Changed width='auto' to a numeric value or fixed aspect ratio */}
              <svg
                width={isScrolled ? '36' : '48'}
                height={isScrolled ? '36' : '48'}
                viewBox="0 0 72 72"
                className={`transition-all duration-300 hidden md:block ${isScrolled ? 'text-black' : 'text-white'
                  }`}
              >
                <path
                  d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z"
                  fill="currentColor"
                />
                <text x="36" y="48" fontSize="32" fontWeight="bold" fill="currentColor" fontFamily="monospace">EI</text>
              </svg>

              {/* Mobile SVG logo */}
              <svg
                width="35"
                height="35"
                viewBox="0 0 72 72"
                className={`transition-all duration-300 md:hidden ${isScrolled ? 'text-black' : 'text-white'
                  }`}
              >
                <path
                  d="M4 8h8v8h-8zM12 8h8v8h-8zM12 16h8v8h-8zM20 16h8v8h-8zM20 24h8v8h-8zM12 24h8v8h-8zM4 24h8v8h-8z"
                  fill="currentColor"
                />
                <text x="36" y="48" fontSize="15" fontWeight="bold" fill="currentColor" fontFamily="monospace">EI</text>
              </svg>

              {/* "> 30" text - Added whitespace-nowrap and items-center alignment */}
              <span
                className={`font-bold tracking-tight transition-all duration-300 hidden md:inline whitespace-nowrap leading-none ${isScrolled ? 'text-black text-[20px]' : 'text-white text-[48px]'
                  }`}
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                &gt; 30
              </span>
            </div>
          </Link>

          {/* Right side icons */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className={`p-2 md:p-2.5 rounded-full transition-colors ${isScrolled ? 'text-black font-bold hover:bg-black/5' : 'text-white hover:bg-white/10'
                }`}
            >
              <Search className="w-5 h-5 md:w-5 md:h-5" strokeWidth={3.5} />
            </button>

            <button
              onClick={onMenuClick}
              className={`p-2 md:p-2.5 rounded-full transition-colors ${isScrolled ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/10'
                }`}
            >
              <Menu className="w-4 h-4 md:w-5 md:h-5" strokeWidth={4} />
            </button>

            {/* EI logo SVG - Right Side */}
            <Link
              to="/"
              className="flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
              aria-label="Home"
            >
              <svg
                width="auto"
                height={isScrolled ? '28' : '40'}
                viewBox="0 0 80 50"
                className={`transition-all duration-300 ${isScrolled ? 'text-black' : 'text-white'
                  }`}
              >
                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isScrolled ? "28" : "42"}
                  fontWeight="900"
                  fill="currentColor"
                  fontFamily="sans-serif"
                >
                  EI
                </text>
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
});