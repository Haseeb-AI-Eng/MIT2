import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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
type CardRole = 'huge' | 'wide' | 'side' | 'normal';

interface RowPattern {
  roles: CardRole[];
  cols: number[];
}

const ROW_PATTERNS: RowPattern[] = [
  { roles: ['normal', 'normal', 'normal'], cols: [1, 1, 1] }, // Row 1: 3 items (since sidebar + search take space)
  { roles: ['huge', 'normal', 'normal'], cols: [2, 1, 1] },    // Changed huge to 2x2 (col-span-2)
  { roles: ['normal', 'normal', 'huge'], cols: [1, 1, 2] },    // Changed huge to 2x2 (col-span-2)
  { roles: ['normal', 'normal', 'normal', 'normal'], cols: [1, 1, 1, 1] },
  { roles: ['wide', 'normal', 'normal'], cols: [2, 1, 1] },
  { roles: ['normal', 'wide', 'normal'], cols: [1, 2, 1] },
  { roles: ['normal', 'normal', 'wide'], cols: [1, 1, 2] },
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

function getGridSpanClasses(colSpan: number, isRowStart: boolean, role: CardRole, isFirstRow: boolean) {
  let classes = '';
  if (isRowStart) {
    classes += isFirstRow ? 'lg:col-start-2 ' : 'lg:col-start-1 ';
  }

  if (role === 'huge' || role === 'wide') {
    return classes + 'col-span-1 sm:col-span-2 lg:col-span-2 row-span-2 ';
  }
  if (colSpan === 2) {
    classes += 'col-span-1 sm:col-span-2 lg:col-span-2 ';
  } else {
    classes += 'col-span-1 ';
  }
  return classes.trim();
}

interface AssignedCard {
  project: any;
  role: CardRole;
  colSpan: number;
  isRowStart?: boolean;
  isFirstRow?: boolean;
}

export const Home = React.memo(function Home() {
  const navigate = useNavigate();
  const [publishedProjects, setPublishedProjects] = useState<any[]>([]);
  const [visibleProjects, setVisibleProjects] = useState<any[]>([]);
  const [hiddenProjects, setHiddenProjects] = useState<any[]>([]);
  const [projectViews, setProjectViews] = useState<Record<string, number>>(getLocalProjectViews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSection, setActiveSection] = useState('Highlights');

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

    if (
      ROTATION_INTERVAL_MS <= 0 ||
      ROTATION_SWAP_SIZE <= 0 ||
      hiddenProjects.length === 0 ||
      visibleProjects.length === 0
    ) {
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

  const filteredProjects = useMemo(() => visibleProjects, [visibleProjects]);

  // Now takes the full project object too, so we can hand it to ProjectDetail
  // via router state. That lets ProjectDetail render immediately instead of
  // waiting on a fresh network fetch — the fetch still happens in the
  // background to keep the data fresh, but the user sees content instantly.
  const handleProjectClick = useCallback(
    (projectId: string | undefined, project: any) => {
      if (!projectId || typeof window === 'undefined') {
        return;
      }

      const nextCount = markLocalProjectViewed(projectId);
      setProjectViews((prevViews) => ({
        ...prevViews,
        [projectId]: nextCount,
      }));
      navigate(`/projects/${projectId}`, { state: { project } });
    },
    [navigate]
  );

  const routeMap: Record<string, string> = {
    Highlights: '/',
    Research: '/research',
    About: '/about',
    Projects: '/support-media-lab',
    'Academia Outreach': '/mas-graduate-program',
    Solutions: '/',
    Products: '/360-vr-tour',
    'Add Research Project': '/add-research-project',
  };

  const assignedCards = useMemo<AssignedCard[]>(() => {
    const result: AssignedCard[] = [];
    let projectIdx = 0;

    // Row 1: 3 projects (1x1) to leave space for the sidebar in col 1
    const firstPattern = ROW_PATTERNS[0];
    for (let i = 0; i < 3 && projectIdx < filteredProjects.length; i++) {
      result.push({
        project: filteredProjects[projectIdx++],
        role: 'normal',
        colSpan: firstPattern.cols[i],
        isRowStart: i === 0, 
        isFirstRow: true,
      });
    }

    // Handle subsequent rows: Use 4-column patterns starting from the first column
    let patternIdx = 1;
    while (projectIdx < filteredProjects.length) {
      const pattern = ROW_PATTERNS[patternIdx];
      const take = Math.min(filteredProjects.length - projectIdx, pattern.roles.length);
      for (let i = 0; i < take; i++) {
        result.push({
          project: filteredProjects[projectIdx++],
          role: pattern.roles[i],
          colSpan: pattern.cols[i],
          isRowStart: i === 0,
          isFirstRow: false,
        });
      }
      patternIdx = (patternIdx % (ROW_PATTERNS.length - 1)) + 1;
    }

    return result;
  }, [filteredProjects]);

  return (
    /* Fix 1: Add overflow-x-hidden to prevent horizontal overflow which often triggers double scrollbars */
    <div className="relative overflow-x-hidden w-full">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        data-hero-section
        className="relative w-full bg-black text-white min-h-[60vh] sm:min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden z-0"
      >
        <div className="absolute inset-0">
          <HeroVideo />
        </div>
        <div className="relative z-10 w-full max-w-[90vw] px-4 sm:px-6 pt-20 md:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full text-[32px] sm:text-[36px] md:text-[42px] md:ml-36 leading-[1.0] sm:leading-tight px-0 md:px-8 max-w-full md:max-w-none font-sans font-bold"
            style={{ fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif", fontWeight: 500 }}
          >
            Imagine what we can become.
          </motion.h1>
        </div>
      </section>

      {/* ── Unified Grid Area ──────── */}
      {/* Fix 2: Ensure the section doesn't have redundant overflow settings that conflict with its children */}
      <section className="relative w-full z-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-0 items-stretch auto-rows-auto grid-flow-dense w-full bg-white relative">
          
          {/* Sidebar: Occupies the first column in row 1 */}
          <aside className="hidden lg:block lg:col-start-1 lg:row-start-1 relative z-50 -mt-[140px] border-r border-black/10 self-stretch bg-white">
            <div className="sticky top-[140px] z-20 bg-white">
              <nav className="py-4">
                <div className="space-y-0">
                  {['Highlights', 'Research', 'About', 'Projects', 'Academia Outreach', 'Solutions', 'Products', 'Add Research Project'].map((section) => (
                    <button
                      key={section}
                      onClick={() => {
                        setActiveSection(section);
                        navigate(routeMap[section] || '/');
                      }}
                      className={`w-full text-left px-6 pl-8 py-2 text-[13px] leading-5 transition-colors font-bold ${
                        activeSection === section
                          ? 'text-[#E91E63]'
                          : 'text-black hover:text-black'
                      }`}
                      style={{
                        fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif",
                        fontWeight: 700,
                      }}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </nav>
            </div>
          </aside>

          {/* Article Cards */}
          {loading && (
            <div className="lg:col-start-2 lg:col-span-3 animate-pulse bg-black/5 h-64 m-6" />
          )}
          {!loading && error && (
            <div className="lg:col-start-2 lg:col-span-3 text-red-600 px-6">Could not fetch latest projects.</div>
          )}

          {assignedCards.map(({ project, role, colSpan, isRowStart, isFirstRow }, index) => {
            const projectId = getProjectId(project);
            return (
              <motion.div
                key={project._id ?? project.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: (index % 6) * 0.05 }}
                className={`${getGridSpanClasses(colSpan, !!isRowStart, role, !!isFirstRow)} ${role === 'wide' || role === 'huge' ? 'row-span-2' : ''} h-full w-full border-b border-r border-black/5`}
                style={role === 'wide' || role === 'huge' ? { gridRow: 'span 2' } : undefined}
              >
                <NewsCard
                  image={project.coverImage || project.cover_image || ''}
                  title={project.title}
                  description={project.description}
                  category={project.tags?.[0] || 'Research'}
                  onClick={() => handleProjectClick(projectId, project)}
                  viewCount={projectId ? projectViews[projectId] ?? 0 : 0}
                  size={role === 'huge' || role === 'wide' ? 'large' : 'medium'}
                  aspect={role === 'huge' || role === 'wide' ? 'wide' : 'normal'}
                />
              </motion.div>
            );
          })}

          {/* Support Section */}
          {/* Fix 3: Ensure this section takes full width (col-span-2 on mobile, col-span-4 on large) */}
          <section className="col-span-2 lg:col-span-4 mb-10 rounded-none border border-white/10 bg-[#050505] px-6 py-10 text-white">
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
        </div>
      </section>
    </div>
  );
});