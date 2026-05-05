import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { fetchPublishedProjects } from '../api';

export function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedProjects(18, 1)
      .then((data) => {
        setProjects(data.projects || []);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => (p._id ?? p.slug) !== projectId));
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-black text-white">
        <img src="/image.gif" alt="Projects hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
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
          <p className="text-black/60">{projects.length} projects available</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-black/50">Loading projects...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-600">Unable to load projects. Try again later.</div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-black/60">No published projects are available yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id ?? project.slug}
                image={project.coverImage || project.cover_image || '/image.gif'}
                title={project.title}
                category={project.tags?.[0] || 'Research'}
                teamLabel={`${project.team?.length || 0} team members`}
                onClick={() => navigate(`/projects/${project.slug || project._id}`)}
                onDelete={() => handleDeleteProject(project._id ?? project.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
