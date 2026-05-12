import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { fetchPublishedProjects } from '../api';

const PAGE_SIZE = 12;

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

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => (p._id ?? p.slug) !== projectId));
  };
  return (
    <div className="min-h-screen bg-white">
      <section data-hero-section className="relative overflow-hidden bg-black text-white">
        <img src="/image.gif" alt="Projects hero" className="absolute inset-0 w-full h-full object-cover opacity-60" fetchPriority="high" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative mx-auto max-w-[1200px] px-6 py-24 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4">Research Projects</p>
          <h1 className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto">
            A curated collection of MIT-style projects, built for review and publication.
          </h1>
          <p className="max-w-3xl mx-auto text-white/70 mt-6 text-[16px] md:text-[18px]">
            Browse featured work, team members, and approval status for each research initiative.
          </p>
        </div>
      </section>

      <div className="lg:ml-80 px-4 md:px-8 py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-[12px] uppercase tracking-[0.25em] text-black/40 mb-2">Published Projects</p>
            <h2 className="text-[28px] md:text-[36px] font-semibold text-black">Latest research, engineered for public launch.</h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project._id ?? project.slug}
                  image={project.coverImage || project.cover_image || '/image.gif'}
                  title={project.title}
                  category={project.tags?.[0] || 'Research'}
                  teamLabel={`${project.teamCount ?? project.team?.length ?? 0} team member${(project.teamCount ?? project.team?.length ?? 0) !== 1 ? 's' : ''}`}
                  onClick={() => navigate(`/projects/${project.slug || project._id}`)}
                  onDelete={() => handleDeleteProject(project._id ?? project.slug)}
                />
              ))}
              {loadingMore && Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={`more-${i}`} />)}
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