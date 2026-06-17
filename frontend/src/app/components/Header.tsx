import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
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

  const elementsTextRef = useRef<HTMLSpanElement>(null);
  const interactiveTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Immediately reset scroll state on route change
    setIsScrolled(window.scrollY > scrollThreshold);

    let scrollListener: (() => void) | null = null;
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    function attachToHero(heroSection: Element) {
      // Clean up any plain scroll listener since we now have a hero
      if (scrollListener) {
        window.removeEventListener('scroll', scrollListener);
        scrollListener = null;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          setIsScrolled(!entry.isIntersecting);
        },
        { root: null, threshold: 0.1 }
      );
      observer.observe(heroSection);

      // Scroll fallback so it still works if observer fires late
      scrollListener = () => setIsScrolled(window.scrollY > scrollThreshold);
      window.addEventListener('scroll', scrollListener, { passive: true });
    }

    function tryAttach() {
      const heroSection = document.querySelector('[data-hero-section]');
      if (heroSection) {
        // Hero already in DOM — attach immediately and stop watching
        mutationObserver?.disconnect();
        mutationObserver = null;
        attachToHero(heroSection);
        return true;
      }
      return false;
    }

    if (!tryAttach()) {
      // Hero not in DOM yet (async page still loading) — fall back to scroll
      // listener now, but keep watching the DOM so we can upgrade to the
      // hero-aware IntersectionObserver once it mounts.
      scrollListener = () => setIsScrolled(window.scrollY > scrollThreshold);
      window.addEventListener('scroll', scrollListener, { passive: true });

      mutationObserver = new MutationObserver(() => {
        if (tryAttach()) {
          mutationObserver?.disconnect();
          mutationObserver = null;
        }
      });
      mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      if (scrollListener) window.removeEventListener('scroll', scrollListener);
      observer?.disconnect();
      mutationObserver?.disconnect();
    };
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

  // Match ELEMENTS letter-spacing to INTERACTIVE width
  useLayoutEffect(() => {
    const elementsEl = elementsTextRef.current;
    const interactiveEl = interactiveTextRef.current;
    if (!elementsEl || !interactiveEl) return;

    const applySpacing = () => {
      const text = elementsEl.textContent || '';
      const gaps = Math.max(text.length - 1, 1);

      elementsEl.style.letterSpacing = '0px';
      const targetWidth = interactiveEl.getBoundingClientRect().width;
      const naturalWidth = elementsEl.getBoundingClientRect().width;

      let spacing = (targetWidth - naturalWidth) / gaps;
      elementsEl.style.letterSpacing = `${spacing}px`;

      const appliedWidth = elementsEl.getBoundingClientRect().width;
      const residual = targetWidth - appliedWidth;
      if (Math.abs(residual) > 0.5) {
        spacing += residual / gaps;
        elementsEl.style.letterSpacing = `${spacing}px`;
      }
    };

    applySpacing();
    window.addEventListener('resize', applySpacing);

    if (typeof document !== 'undefined' && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(applySpacing);
    }

    return () => window.removeEventListener('resize', applySpacing);
  }, [isMobile]);

  // Derived colors — all driven by isScrolled
  const chevronColor = isScrolled ? 'text-black' : 'text-white';
  const outlineColor = isScrolled ? '#000000' : '#FFFFFF';
  const wordmarkColor = isScrolled ? 'text-black' : 'text-white';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-[opacity] ${
          isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'
        }`}
      >
        <div
          className={`px-4 md:px-6 flex items-center justify-between border-b transition-all duration-300 ${
            isScrolled ? 'border-black/10 py-3' : 'border-transparent pt-6 md:pt-12 pb-2 md:pb-4'
          }`}
        >
          {/* Logo: icon + chevron */}
          <Link to="/" className="flex items-center shrink-0">
            <div className="flex items-center gap-1 md:gap-2 transition-all duration-300 h-[80px]">
              <LogoIcon height={isMobile ? 56 : isScrolled ? 42 : 56} outlineColor={outlineColor} />
              <span
                className={`font-bold tracking-tight transition-all duration-300 whitespace-nowrap leading-none ${chevronColor} ${
                  isScrolled ? 'text-[22px]' : 'text-[44px] md:text-[54px]'
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
              className={`p-2 md:p-2.5 rounded-full transition-colors ${
                isScrolled ? 'text-black font-bold hover:bg-black/5' : 'text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-5 h-5 md:w-5 md:h-5" strokeWidth={3.5} />
            </button>

            <button
              onClick={onMenuClick}
              className={`p-2 md:p-2.5 rounded-full transition-colors ${
                isScrolled ? 'text-black hover:bg-black/5' : 'text-white hover:bg-white/10'
              }`}
            >
              <Menu className="w-4 h-4 md:w-5 md:h-5" strokeWidth={4} />
            </button>

            {/* Stacked wordmark: ELEMENTS / INTERACTIVE — color follows scroll state */}
            <Link
              to="/"
              className="flex flex-col items-start leading-none transition-transform hover:scale-105 active:scale-95"
              aria-label="Home"
              style={{ fontFamily: "'Oswald', 'Arial Narrow', sans-serif" }}
            >
              <span
                ref={elementsTextRef}
                className={`font-normal uppercase text-[19px] md:text-[28px] inline-block transition-colors duration-300 ${wordmarkColor}`}
              >
                ELEMENTS
              </span>
              <span
                ref={interactiveTextRef}
                className={`font-normal uppercase text-[19px] md:text-[28px] inline-block transition-colors duration-300 ${wordmarkColor}`}
                style={{ letterSpacing: '-0.035em' }}
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