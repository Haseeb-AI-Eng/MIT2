import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';
import { NewsCard } from '../components/NewsCard';
import { HeroVideo } from './HeroVideo';
import {
  fetchAllPublishedProjects,
  getLocalProjectViews,
  markLocalProjectViewed,
} from '../api';

function getProjectId(project: any): string | undefined {
  if (!project) return undefined;
  return (
    project.slug ||
    (typeof project._id === 'string' ? project._id : project._id?.toString())
  );
}

// ─── Row layout definitions ──────────────────────────────────────────────────
// Each row pattern consumes exactly the projects it defines.
// 'wide'   = 2-column featured card (aspect-[16/8])
// 'side'   = 1-column card next to a wide card (tall portrait, matches wide height)
// 'normal' = 1-column standard card
//
// Every pattern must fill exactly 3 columns so there are no gaps:
//   wide(2) + side(1) = 3 ✓
//   side(1) + wide(2) = 3 ✓
//   normal(1) + normal(1) + normal(1) = 3 ✓

type CardRole = 'wide' | 'side' | 'normal';

interface RowPattern {
  roles: CardRole[];    // roles in order, must sum to 3 cols
  cols: number[];       // tailwind col-span for each card (must sum to 3)
}

const ROW_PATTERNS: RowPattern[] = [
  { roles: ['wide', 'side'],             cols: [2, 1] }, // big left + tall right
  { roles: ['side', 'wide'],             cols: [1, 2] }, // tall left + big right
  { roles: ['normal', 'normal', 'normal'], cols: [1, 1, 1] }, // 3 equal
  { roles: ['wide', 'side'],             cols: [2, 1] },
  { roles: ['normal', 'normal', 'normal'], cols: [1, 1, 1] },
  { roles: ['side', 'wide'],             cols: [1, 2] },
];

const MAX_VISIBLE_PROJECTS = 30;
const ROTATION_INTERVAL_MS = 60_000;
const ROTATION_SWAP_SIZE = 10;

function getRandomIndices(count: number, max: number) {
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * max));
  }
  return Array.from(indices);
}

interface AssignedCard {
  project: any;
  role: CardRole;
  colSpan: number;
}

export const Home = React.memo(function Home() {
  const navigate = useNavigate();
  const [publishedProjects, setPublishedProjects] = useState<any[]>([]);
  const [visibleProjects, setVisibleProjects] = useState<any[]>([]);
  const [hiddenProjects, setHiddenProjects] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [projectViews, setProjectViews] = useState<Record<string, number>>(getLocalProjectViews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const intervalRef = useRef<number | null>(null);
  const visibleRef = useRef<any[]>([]);
  const hiddenRef = useRef<any[]>([]);

  useEffect(() => {
    let active = true;
    fetchAllPublishedProjects()
      .then((res) => {
        if (!active) return;
        const projects = res.projects || [];
        setPublishedProjects(projects);
        setVisibleProjects(projects.slice(0, MAX_VISIBLE_PROJECTS));
        setHiddenProjects(projects.slice(MAX_VISIBLE_PROJECTS));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    visibleRef.current = visibleProjects;
  }, [visibleProjects]);

  useEffect(() => {
    hiddenRef.current = hiddenProjects;
  }, [hiddenProjects]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (hiddenProjects.length === 0 || visibleProjects.length === 0) {
      return;
    }

    intervalRef.current = window.setInterval(() => {
      const currentVisible = visibleRef.current;
      const currentHidden = hiddenRef.current;
      if (currentVisible.length === 0 || currentHidden.length === 0) {
        return;
      }

      const swapCount = Math.min(ROTATION_SWAP_SIZE, currentHidden.length, currentVisible.length);
      if (swapCount === 0) return;

      const visibleIndices = getRandomIndices(swapCount, currentVisible.length);
      const hiddenIndices = getRandomIndices(swapCount, currentHidden.length);
      const nextVisible = [...currentVisible];
      const nextHidden = [...currentHidden];

      for (let i = 0; i < swapCount; i++) {
        const visibleIndex = visibleIndices[i];
        const hiddenIndex = hiddenIndices[i];
        [nextVisible[visibleIndex], nextHidden[hiddenIndex]] = [
          nextHidden[hiddenIndex],
          nextVisible[visibleIndex],
        ];
      }

      setVisibleProjects(nextVisible);
      setHiddenProjects(nextHidden);
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [hiddenProjects.length, visibleProjects.length]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(false);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const query = searchQuery.toLowerCase().trim();
    const matchedProjects = publishedProjects.filter((project) => {
      const title = project.title?.toString().toLowerCase() || '';
      const category = (project.tags?.[0] || project.category || '').toString().toLowerCase();
      const slug = project.slug?.toString().toLowerCase() || '';
      const tags = (project.tags || []).map(String).join(' ').toLowerCase();
      return (
        title.includes(query) ||
        category.includes(query) ||
        tags.includes(query) ||
        slug.includes(query)
      );
    });

    setSearchResults(matchedProjects);
    setSearchError(false);
    setSearchLoading(false);
  }, [searchQuery, publishedProjects]);

  const filteredProjects = useMemo(() => {
    return searchQuery.trim() ? searchResults : visibleProjects;
  }, [searchQuery, searchResults, visibleProjects]);

  const handleProjectClick = useCallback(
    (projectId: string | undefined) => {
      if (!projectId || typeof window === 'undefined') {
        return;
      }

      const nextCount = markLocalProjectViewed(projectId);
      setProjectViews((prevViews) => ({
        ...prevViews,
        [projectId]: nextCount,
      }));
      navigate(`/projects/${projectId}`);
    },
    [navigate]
  );

  // Assign each project a role by walking through row patterns
  const assignedCards = useMemo<AssignedCard[]>(() => {
    const result: AssignedCard[] = [];
    let projectIdx = 0;
    let patternIdx = 0;

    while (projectIdx < filteredProjects.length) {
      const pattern = ROW_PATTERNS[patternIdx % ROW_PATTERNS.length];
      const remaining = filteredProjects.length - projectIdx;

      // If not enough projects to fill this pattern, fall back to normal cards
      if (remaining < pattern.roles.length) {
        for (let i = 0; i < remaining; i++) {
          result.push({
            project: filteredProjects[projectIdx++],
            role: 'normal',
            colSpan: 1,
          });
        }
        break;
      }

      // Assign roles from this pattern
      for (let i = 0; i < pattern.roles.length; i++) {
        result.push({
          project: filteredProjects[projectIdx++],
          role: pattern.roles[i],
          colSpan: pattern.cols[i],
        });
      }

      patternIdx++;
    }

    return result;
  }, [filteredProjects]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        data-hero-section
        className="relative bg-black text-white aspect-auto md:aspect-[16/5] min-h-[62vh] md:min-h-0 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <HeroVideo />
        </div>
        <div className="relative w-full max-w-[90vw] px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full text-[36px] sm:text-[40px] md:text-[40px] md:ml-36 leading-[1.05] sm:leading-tight px-0 md:px-8 max-w-full md:max-w-none z-10 font-sans font-semibold"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontWeight: 500 }}
          >
            Imagine what we can become.
          </motion.h1>
        </div>
      </section>

      {/* ── Research Grid ────────────────────────────────────────────────── */}
      <section className="lg:ml-80 px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        <div className="mb-10">

          {/* Header row */}
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between mb-6">
            <div className="min-w-0">
              <p className="text-[12px] uppercase tracking-[0.24em] text-black/40">Latest Research</p>
            </div>

            <div className="w-full xl:w-[440px]">
              <div className="relative rounded-xl border border-black/10 bg-white px-3 py-2 shadow-sm shadow-black/5 transition hover:border-black/20 focus-within:border-black/20 focus-within:ring-2 focus-within:ring-black/10">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter projects by title, category, or tags"
                  aria-label="Filter projects by title, category, or tags"
                  className="w-full rounded-xl border-none bg-transparent pl-11 pr-3 py-1.5 text-black text-[15px] placeholder:text-black/35 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {searchQuery.trim() && searchError && (
            <div className="mb-6 rounded-[28px] border border-black/10 bg-white p-4 shadow-sm shadow-black/5">
              <div className="text-[14px] text-red-600">Unable to filter right now. Please try again.</div>
            </div>
          )}

          {searchQuery.trim() && !searchError && !searchLoading && filteredProjects.length === 0 && (
            <div className="mb-4 text-[14px] text-black/50">
              No research projects match “{searchQuery}”.
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              <div className="col-span-1 sm:col-span-2 lg:col-span-2 animate-pulse bg-black/5" style={{ aspectRatio: '16/8' }} />
              <div className="col-span-1 animate-pulse bg-black/5" style={{ aspectRatio: '4/5' }} />
              <div className="col-span-1 animate-pulse bg-black/5 h-64" />
              <div className="col-span-1 animate-pulse bg-black/5 h-64" />
              <div className="col-span-1 animate-pulse bg-black/5 h-64" />
            </div>
          )}

          {/* ── Error ── */}
          {!loading && error && (
            <div className="text-red-600">Could not fetch latest projects.</div>
          )}

          {/* ── Empty ── */}
          {!loading && !error && publishedProjects.length === 0 && (
            <div className="text-black/60">No published projects are available yet.</div>
          )}

          {/* ── Masonry grid ── */}
          {!loading && !error && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 items-start">
              {assignedCards.map(({ project, role }, index) => {
                const projectId = getProjectId(project);
                return (
                  <motion.div
                    key={project._id ?? project.slug}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.35, ease: 'easeOut', delay: (index % 6) * 0.05 }}
                    className={
                      role === 'wide'
                        ? 'col-span-1 sm:col-span-2 lg:col-span-2'
                        : 'col-span-1'
                    }
                  >
                    <NewsCard
                      image={project.coverImage || project.cover_image || ''}
                      title={project.title}
                      description={project.description}
                      category={project.tags?.[0] || 'Research'}
                      onClick={() => handleProjectClick(projectId)}
                      viewCount={projectId ? projectViews[projectId] ?? 0 : 0}
                      size={role === 'wide' ? 'large' : role === 'side' ? 'medium' : 'medium'}
                      aspect={role === 'wide' ? 'wide' : role === 'side' ? 'side' : 'normal'}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Support EI ───────────────────────────────────────────────────── */}
        <section className="mb-10 rounded-none border border-white/10 bg-[#050505] px-6 py-10 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[32px] md:text-[48px] font-semibold">Support EI</h2>
            <p className="mt-4 text-[15px] md:text-[16px] text-white/70 max-w-2xl mx-auto">
              We believe that together, we can play an important role in helping people realize a
              better and more just future for themselves and for all.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button className="rounded-none border border-white/80 bg-transparent px-6 py-4 text-left text-white font-semibold transition hover:bg-white/10">
              Corporate membership
            </button>
            <button
              onClick={() => navigate('/foundations')}
              className="rounded-none border border-white/80 bg-transparent px-6 py-4 text-left text-white font-semibold transition hover:bg-white/10"
            >
              Foundations
            </button>
            <button
              onClick={() => navigate('/alumni-friends')}
              className="sm:col-span-2 mx-auto max-w-[360px] rounded-none border border-white/80 bg-transparent px-6 py-4 text-left text-white font-semibold transition hover:bg-white/10"
            >
              Alumni + friends
            </button>
          </div>
        </section>
      </section>
    </div>
  );
});