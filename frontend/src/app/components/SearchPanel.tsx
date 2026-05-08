import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchArticles } from '../api';

interface SearchResult {
  slug: string;
  id: string;
  title: string;
  category: string;
  excerpt: string;
  description: string;
  image: string;
  resultType: 'article' | 'project';
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPanel({ isOpen, onClose }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSelectedIndex(-1);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await searchArticles(q);
      setResults(data);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    setQuery('');
    setResults([]);
    if (result.resultType === 'project') {
      navigate(`/projects/${result.slug}`);
    } else {
      navigate(`/article/${result.slug}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[selectedIndex] as HTMLElement;
      if (item) item.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-[95] h-full w-full sm:w-[480px] md:w-[540px] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-black/60 hover:text-black transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <span className="text-[13px] font-semibold text-black/40 uppercase tracking-wide">
              Find People, Projects, etc.
            </span>
          </div>
        </div>

        {/* Search input */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 border-b border-black/15 pb-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-black/30 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder=""
              className="flex-1 text-[16px] text-black placeholder:text-black/30 outline-none bg-transparent"
            />
            {loading && (
              <span className="text-[12px] text-black/30 animate-pulse">Searching...</span>
            )}
          </div>
        </div>

        {/* Results list */}
        <div ref={listRef} className="flex-1 overflow-y-auto">
          {results.length === 0 && query.trim() && !loading && (
            <div className="px-6 py-12 text-center text-black/30 text-[14px]">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}
          {!query.trim() && (
            <div className="px-6 py-12 text-center text-black/30 text-[14px]">
              Start typing to search...
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={`${result.resultType}-${result.slug}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors border-b border-black/[0.06] ${
                i === selectedIndex ? 'bg-blue-50/70' : 'hover:bg-black/[0.02]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-[14px] text-black leading-snug font-medium line-clamp-2 overflow-hidden text-ellipsis">
                  {highlightMatch(result.title, query)}
                </p>
                <p className="text-[12px] text-black/35 mt-1 truncate">
                  {result.source || result.category}
                </p>
              </div>
              <span className="text-[12px] text-black/30 shrink-0 mt-0.5 whitespace-nowrap ml-2">
                {result.resultType === 'project' ? 'Project' : 'Article'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <>
      {before}
      <mark className="bg-yellow-200 text-black rounded-[2px] px-[1px]">{match}</mark>
      {after}
    </>
  );
}
