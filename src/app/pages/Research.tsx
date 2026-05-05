import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPublishedProjects } from '../api';
import { ResearchCard } from '../components/ResearchCard';

const cyclingWords = ['#health', '#design', '#AI', '#robotics', '#climate', '#education'];

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

export function Research() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedProjects(18, 1)
      .then((data) => {
        setProjects(data.projects || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

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

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter((p) => (p._id ?? p.slug) !== projectId));
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-black text-white">
        <img
          src="/image.gif"
          alt="Research hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto max-w-[1200px] px-6 py-24 text-center">
          <p className="text-[12px] uppercase tracking-[0.35em] text-white/60 mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            MIT Media Lab research
          </p>
          <h1
            className="text-[32px] md:text-[52px] font-semibold leading-tight md:leading-[1.1] max-w-4xl mx-auto"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            We are an interdisciplinary research lab working to invent the future of{' '}
            <span
              className="text-[#ff33b8] inline-block transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0 }}
            >
              {cyclingWords[wordIndex]}
            </span>
          </h1>
        </div>
      </section>

      <div className="lg:ml-80 px-4 md:px-8 py-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/40 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
              Research Projects
            </p>
            <h2
              className="text-[32px] md:text-[42px] font-semibold text-black"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Published teams and ongoing work
            </h2>
          </div>
          <p className="text-black/50" style={{ fontFamily: 'Georgia, serif' }}>
            {loading ? 'Loading…' : `${projects.length} published projects`}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-black/50" style={{ fontFamily: 'Georgia, serif' }}>Loading published projects...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-600">Unable to load research projects.</div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center text-black/60" style={{ fontFamily: 'Georgia, serif' }}>
            No projects are published yet. Add them through the admin system.
          </div>
        ) : (
          /* Grid with shared borders — no gap so borders connect */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-t border-l border-black/12"
            style={{ borderTop: '1px solid rgba(0,0,0,0.12)', borderLeft: '1px solid rgba(0,0,0,0.12)' }}
          >
            {projects.map((project) => (
              <ResearchCard
                key={project._id ?? project.slug}
                title={project.title}
                subtitle={toShortDescription(project.description || '', 100)}
                logoText={makeLogoText(project.title)}
                tags={(project.tags || []).slice(0, 3)}
                teamCount={project.team?.length || 0}
                status={project.status || 'published'}
                authorName={getAuthorName(project)}
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