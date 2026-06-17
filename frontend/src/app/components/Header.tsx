import React, { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SearchPanel } from './SearchPanel';

interface HeaderProps {
  onMenuClick?: () => void;
}

// 4 columns x 6 rows. 'outline' = empty cell, just a bordered square.
const LOGO_GRID: ('red' | 'white' | 'outline')[][] = [
  ['red', 'red', 'red', 'outline'],
  ['red', 'white', 'white', 'white'],
  ['red', 'red', 'red', 'white'],
  ['red', 'white', 'white', 'white'],
  ['red', 'red', 'red', 'white'],
  ['outline', 'white', 'white', 'white'],
];

const RED = '#910B08';
const COLS = 4;
const ROWS = 6;
const CELL = 16;
const GAP = 2.5;

function LogoIcon({ height, outlineColor }: { height: number; outlineColor: string }) {
  const width = height * (COLS / ROWS);
  const vbW = COLS * CELL;
  const vbH = ROWS * CELL;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${vbW} ${vbH}`} className="shrink-0">
      {LOGO_GRID.map((row, r) =>
        row.map((type, c) => {
          const x = c * CELL + GAP / 2;
          const y = r * CELL + GAP / 2;
          const s = CELL - GAP;

          if (type === 'red') {
            return <rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} fill={RED} />;
          }
          if (type === 'white') {
            return <rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} fill="#FFFFFF" />;
          }
          return (
            <rect
              key={`${r}-${c}`}
              x={x + 1}
              y={y + 1}
              width={s - 2}
              height={s - 2}
              fill="none"
              stroke={outlineColor}
              strokeWidth={1.5}
            />
          );
        })
      )}
    </svg>
  );
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
  const scrollThreshold = 80;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const heroSection = document.querySelector('[data-hero-section]');

    if (!heroSection) {
      const handleScroll = () => setIsScrolled(window.scrollY > scrollThreshold);
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }

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

  const chevronColor = isScrolled ? 'text-black' : 'text-white';
  const outlineColor = isScrolled ? '#000000' : '#FFFFFF';

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
          {/* Logo: icon + chevron */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="flex items-center gap-1 md:gap-2 transition-all duration-300 h-[80px]">
              <LogoIcon height={isMobile ? 48 : (isScrolled ? 36 : 48)} outlineColor={outlineColor} />
              <span
                className={`font-bold tracking-tight transition-all duration-300 whitespace-nowrap leading-none ${chevronColor} ${isScrolled ? 'text-[20px]' : 'text-[40px] md:text-[48px]'
                  }`}
                style={{ fontFamily: "'Courier New', monospace" }}
              >
                &gt;
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

            {/* Stacked wordmark: ELEMENTS / INTERACTIVE */}
            <Link
              to="/"
              className="flex flex-col items-start leading-none transition-transform hover:scale-105 active:scale-95"
              aria-label="Home"
              style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif" }}
            >
              <span className="font-bold uppercase text-black text-[16px] md:text-[22px] tracking-tight">
                ELEMENTS
              </span>
              <span
                className="font-bold uppercase text-[16px] md:text-[22px] tracking-tight"
                style={{ color: RED }}
              >
                INTERACTIVE
              </span>
            </Link>
          </div>
        </div>
      </header>

      <SearchPanel isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
});