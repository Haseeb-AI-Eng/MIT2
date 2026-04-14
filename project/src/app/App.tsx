import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';
import { Home } from './pages/Home';
import { ArticleDetail } from './pages/ArticleDetail';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Sidebar />
      {children}
      {/* Footer */}
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
              {['News + Updates', 'Research', 'About', 'Support the Media Lab', 'MAS Graduate Program', 'People', 'Events', 'Videos', 'Member Portal', 'For Press + Media'].map((link) => (
                <a key={link} href="#" className="text-[14px] text-black/80 hover:text-black transition-colors">{link}</a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <span className="text-[14px] font-semibold text-black/50 mb-1">More ways to explore</span>
              {['Videos', 'Publications', 'Job Opportunities', 'Contact'].map((link) => (
                <a key={link} href="#" className="text-[14px] text-black/80 hover:text-black transition-colors">{link}</a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start lg:items-end gap-4">
            <div className="flex gap-4 text-black">
              <a href="#" className="hover:text-black/60 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
              <a href="#" className="hover:text-black/60 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
              <a href="#" className="hover:text-black/60 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg></a>
              <a href="#" className="hover:text-black/60 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
              <a href="#" className="hover:text-black/60 transition-colors"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141a.506.506 0 01.171.325c.016.093.036.306.02.472z"/></svg></a>
            </div>
            <svg width="50" height="32" viewBox="0 0 80 50" className="text-black"><text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" fontSize="42" fontWeight="900" fill="currentColor" fontFamily="sans-serif" letterSpacing="1">MIT</text></svg>
            <div className="text-right lg:text-left">
              <p className="text-[13px] text-black/70">Massachusetts Institute of Technology</p>
              <p className="text-[13px] text-black/70">School of Architecture + Planning</p>
            </div>
            <div className="flex flex-col gap-1">
              <a href="#" className="text-[13px] text-black/70 hover:text-black transition-colors">Accessibility</a>
              <a href="#" className="text-[13px] text-black/70 hover:text-black transition-colors">Donate to the Lab</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/article/:id" element={<Layout><ArticleDetail /></Layout>} />
      </Routes>
    </>
  );
}
