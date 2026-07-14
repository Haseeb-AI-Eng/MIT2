import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { SearchPanel } from './SearchPanel';
import LogoIcon from './Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

// shared LogoIcon imported from ./Logo

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
  const outlineColor = isScrolled ? '#000000' : '#FFFFFF';
  const wordmarkColor = isScrolled ? 'text-black' : 'text-white';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 will-change-[opacity] ${
          isScrolled ? 'bg-white/60 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      >
        <div
          className={`px-4 md:px-6 flex items-center justify-between border-b transition-all duration-300 ${
            isScrolled ? 'border-black/5 py-2' : 'border-transparent pt-6 md:pt-12 pb-2 md:pb-4'
          }`}
        >
          {/* Logo: icon only */}
          <Link to="/" className="flex items-center shrink-0">
            <div className={`flex items-center transition-all duration-300 ${isScrolled ? 'h-[40px]' : 'h-[80px]'}`}>
              <LogoIcon height={isMobile ? (isScrolled ? 24 : 40) : isScrolled ? 32 : 56} outlineColor={outlineColor} />
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