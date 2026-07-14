import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublishedProjects, trackProjectView, fetchProjectViewCount } from '../api';
import { ResearchCard } from '../components/ResearchCard';
import { TopPageNav } from '../components/TopPageNav';

const cyclingWords = ['#health', '#design', '#AI', '#robotics', '#education'];
const PAGE_SIZE = 12;

function makeLogoText(text: string) {
  const parts = text
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase());
  return parts.slice(0, 2).join('') || text.slice(0, 2).toUpperCase();
}

function toShortDescription(text: string, length = 120) {
  if (!text) return 'A published research project from the platform.';
  return text.length > length ? `${text.slice(0, length).trim()}...` : text;
}

function getAuthorName(project: any): string | undefined {
  const team = project.team || [];
  if (!team.length) return undefined;
  const first = team[0];
  if (first?.user?.name) return first.user.name;
  if (first?.name) return first.name;
  if (typeof first === 'string') return first;
  return undefined;
}

function ResearchCardSkeleton() {
  return (
    <div className="w-full bg-white border-b border-r border-black/12 animate-pulse"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.12)', borderRight: '1px solid rgba(0,0,0,0.12)' }}>
      <div className="p-7 flex flex-col gap-4 min-h-[280px]">
        <div className="flex items-center gap-4">
          <div className="w-[72px] h-[72px] bg-gray-200 rounded" />
          <div className="h-5 bg-gray-200 rounded w-32" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
          <div className="h-4 bg-gray-100 rounded w-3/5" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

export function Research() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const abortRef = useRef<AbortController | null>(null);

  const loadProjects = useCallback(async (pageNum: number, replace: boolean) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (replace) setLoading(true);
    else setLoadingMore(true);
    setError(false);

    try {
      const data = await fetchPublishedProjects(PAGE_SIZE, pageNum, controller.signal);
      if (replace) {
        setProjects(data.projects);
      } else {
        setProjects(prev => [...prev, ...data.projects]);
      }
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setPage(pageNum);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setError(true);
    } finally {
      if (replace) setLoading(false);
      else setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadProjects(1, true);
    return () => { abortRef.current?.abort(); };
  }, [loadProjects]);

  // Fetch view counts when projects change
  useEffect(() => {
    if (projects.length === 0) return;
    
    const fetchViews = async () => {
      const counts: Record<string, number> = {};
      for (const project of projects) {
        const projectId = project._id ?? project.slug;
        if (!projectId) continue;
        const count = await fetchProjectViewCount(projectId);
        counts[projectId] = count;
      }
      setViewCounts(counts);
    };
    
    fetchViews();
  }, [projects]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % cyclingWords.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleProjectClick = async (project: any) => {
    const projectId = project._id ?? project.slug;
    
    // Track view on the server
    try {
      const count = await trackProjectView(projectId);
      if (count !== null) {
        setViewCounts(prev => ({
          ...prev,
          [projectId]: count,
        }));
      }
    } catch (err) {
      console.error('Failed to track view:', err);
    }
    
    // Navigate to project detail
    navigate(`/projects/${project.slug || project._id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <section data-hero-section className="relative overflow-hidden bg-black text-white aspect-auto md:aspect-[16/5] min-h-[40vh] md:min-h-0 flex items-center justify-center">
        <img
          src="/image.gif"
          alt="Research hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 text-center z-10">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4">
            EI research
          </p>
          <h1 className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto">
            We are an interdisciplinary research lab working to invent the future of{' '}
            <span
              className="text-[#3b82f6] inline-block transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0 }}
            >
              {cyclingWords[wordIndex]}
            </span>
          </h1>
        </div>
      </section>

      <section className="relative w-full overflow-visible">
        <TopPageNav />
        <div className="flex w-full items-start gap-0">
          <div className="flex-1 min-w-0 w-full px-4 md:px-8 py-12">
            <div className="mx-auto max-w-[1400px]">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-l border-black/12"
                style={{ borderTop: '1px solid rgba(0,0,0,0.12)', borderLeft: '1px solid rgba(0,0,0,0.12)' }}>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => <ResearchCardSkeleton key={i} />)}
              </div>
            ) : error ? (
              <div className="py-20 text-center text-red-600">
                Unable to load research projects.{' '}
                <button className="underline text-blue-600" onClick={() => loadProjects(1, true)}>Retry</button>
              </div>
            ) : projects.length === 0 ? (
              <div className="py-20 text-center text-black/60">
                No projects are published yet. Add them through the admin system.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-l border-black/12"
                  style={{ borderTop: '1px solid rgba(0,0,0,0.12)', borderLeft: '1px solid rgba(0,0,0,0.12)' }}>
                  {projects.map((project) => (
                    <ResearchCard
                      key={project._id ?? project.slug}
                      title={project.title}
                      subtitle={toShortDescription(project.description || '', 100)}
                      logoText={makeLogoText(project.title)}
                      tags={(project.tags || []).slice(0, 3)}
                      teamCount={project.teamCount ?? project.team?.length ?? 0}
                      status={project.status || 'published'}
                      authorName={getAuthorName(project)}
                      viewCount={viewCounts[project._id ?? project.slug] ?? 0}
                      onClick={() => handleProjectClick(project)}
                    />
                  ))}
                  {loadingMore && Array.from({ length: 3 }).map((_, i) => <ResearchCardSkeleton key={`more-${i}`} />)}
                </div>

                {page < totalPages && !loadingMore && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => loadProjects(page + 1, false)}
                      className="px-8 py-3 border border-black text-black text-[14px] tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-200"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}

            {!loading && !error && projects.length > 0 && (
              <div className="mt-12 space-y-5 text-[15px] md:text-[16px] text-black/80 leading-relaxed">
                <p>
                  The Affective Computing group creates and evaluates new ways of bringing together Emotion AI and other affective technologies in order to make people&apos;s lives better.
                </p>
                <p>
                  Our primary motivations are to help people who are not flourishing or at risk of not flourishing. Our projects are diverse: from finding new ways to forecast and prevent depression; to inventing new solutions to help exceptional people who face communication, motivation, and emotion regulation challenges; to enabling robots and computers to respond intelligently to natural human emotional feedback; to enabling people to have better awareness of their own health and wellbeing; to giving people better control and protection over their most sensitive, private, personal data.
                </p>
                <p>
                  Some of our work focuses on making contributions to basic theory and science, including new improvements to machine learning algorithms, while other projects focus on advancing research outside the lab, with applications aimed at improving the lives of individuals in their everyday environments.
                </p>
                <p>
                  Purpose of research and what others can learn from this work is central to our mission: we share findings, methods, and tools so that teams across the world can build better systems, improve wellbeing, and design more humane technology.
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}