import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResearchProjectCard, ResearchProjectCardType } from '../components/ResearchProjectCard';
import { fetchPublishedProjects, trackProjectView, fetchProjectViewCount } from '../api';

const PAGE_SIZE = 12;

function getProjectCardType(project: any, index: number): ResearchProjectCardType {
  if (project.featured || index === 0) return 'featured';
  if (project.videoUrl || project.video_url) return 'video';
  if (index % 7 === 0) return 'category';
  if (index % 5 === 0) return 'text';
  if (index % 4 === 0) return 'statistic';
  return 'standard';
}

function ProjectCardSkeleton() {
  return (
    <div className="w-full animate-pulse">
      <div className="aspect-[16/9] bg-gray-200 mb-4 rounded" />
      <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
      <div className="h-4 bg-gray-100 rounded mb-1 w-1/2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const abortRef = useRef<AbortController | null>(null);
  const navigate = useNavigate();

  const loadProjects = useCallback(async (pageNum: number, replace: boolean) => {
    // Cancel any in-flight request
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

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => (p._id ?? p.slug) !== projectId));
  };

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
      <section data-hero-section className="relative overflow-hidden bg-black text-white">
        <img src="/image.gif" alt="Projects hero" className="absolute inset-0 w-full h-full object-cover opacity-60" fetchPriority="high" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-24 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4">Research Projects</p>
          <h1 className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto">
            A modern research showcase inspired by MIT Media Lab.
          </h1>
          <p className="max-w-3xl mx-auto text-white/70 mt-6 text-[16px] md:text-[18px]">
            Browse featured work across mixed-height cards: image-led features, text highlights, demo previews, and research stats.
          </p>
        </div>
      </section>

      <div className="lg:ml-80 px-4 md:px-8 py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-[12px] uppercase tracking-[0.25em] text-black/40 mb-2">Published Projects</p>
            <h2 className="text-[28px] md:text-[36px] font-semibold text-black">Responsive masonry showcase for active research.</h2>
          </div>
          <p className="text-black/60">
            {loading ? '' : `${total} project${total !== 1 ? 's' : ''} available`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-600">
            Unable to load projects.{' '}
            <button className="underline text-blue-600" onClick={() => loadProjects(1, true)}>Retry</button>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-black/60">No published projects are available yet.</div>
        ) : (
          <>
            <div className="masonry-layout">
              {projects.map((project, index) => (
                <div key={project._id ?? project.slug} className="masonry-item">
                  <ResearchProjectCard
                    project={project}
                    cardType={getProjectCardType(project, index)}
                    viewCount={viewCounts[project._id ?? project.slug] ?? 0}
                    onClick={() => handleProjectClick(project)}
                  />
                </div>
              ))}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => (
                <div key={`more-${i}`} className="masonry-item rounded-[32px] bg-slate-100 p-6 animate-pulse h-[320px]" />
              ))}
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
      </div>
    </div>
  );
}