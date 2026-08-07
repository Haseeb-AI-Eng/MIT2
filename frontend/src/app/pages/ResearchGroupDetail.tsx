import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, Layers3, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  dedupeProjectList,
  fetchAllPublishedProjects,
  fetchProjectViewCount,
  trackProjectView,
} from '../api';
import { TopPageNav } from '../components/TopPageNav';
import hciHeroVideo from '../../assets/hero-videos/research-hero.mp4';
import aiHeroVideo from '../../assets/hero-videos/projects-hero.mp4';
import mediaHeroVideo from '../../assets/hero-videos/solutions-hero.mp4';
import { HeroVideo } from './HeroVideo';
import {
  buildResearchGroups,
  cleanResearchText,
  makeResearchGroupMonogram,
  type ResearchGroupModel,
} from '../utils/researchGroups';

function GroupLogo({ name }: { name: string }) {
  return (
    <div className="relative h-[112px] w-[112px] shrink-0 border-[7px] border-black bg-white">
      <div className="absolute left-[22px] top-[22px] h-[54px] w-[54px] bg-black" />
      <div className="absolute left-[36px] top-[36px] h-[27px] w-[27px] bg-white" />
      <span className="absolute bottom-2 right-2 text-[12px] font-bold tracking-tight text-black">
        {makeResearchGroupMonogram(name)}
      </span>
    </div>
  );
}


function heroVideoForGroup(group: ResearchGroupModel) {
  const searchable = `${group.name} ${group.tags.join(' ')}`.toLowerCase();

  if (searchable.includes('hci') || searchable.includes('human') || searchable.includes('interface')) {
    return hciHeroVideo;
  }

  if (searchable.includes('media') || searchable.includes('culture') || searchable.includes('visual')) {
    return mediaHeroVideo;
  }

  return aiHeroVideo;
}

function ResearchArticleCard({
  project,
  viewCount,
  onOpen,
}: {
  project: any;
  viewCount: number;
  onOpen: () => void;
}) {
  const tags = Array.isArray(project.tags) ? project.tags.slice(0, 4) : [];

  return (
    <article className="group flex min-h-[330px] flex-col border-b border-r border-black/10 bg-white p-7 md:p-8">
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d90000]">
        Research article
      </p>
      <h2 className="mb-4 text-[20px] font-semibold leading-[1.22] text-black">
        {project.title}
      </h2>
      <p className="mb-5 text-[14px] leading-6 text-black/55">
        {cleanResearchText(project.description || project.summary || '', 165)}
      </p>
      <div className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-black/40">
        {tags.map((tag: string) => (
          <span key={tag}>#{String(tag).replace(/^#/, '')}</span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
        <span className="flex items-center gap-1.5 text-[12px] text-black/40">
          <Eye className="h-3.5 w-3.5" /> {viewCount}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.13em] text-black"
        >
          Open article
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

export function ResearchGroupDetail() {
  const { groupSlug = '' } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const abortRef = useRef<AbortController | null>(null);

  const loadProjects = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(false);

    try {
      const result = await fetchAllPublishedProjects(controller.signal);
      setProjects(dedupeProjectList(result.projects || []));
    } catch (requestError: any) {
      if (requestError?.name !== 'AbortError') setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
    return () => abortRef.current?.abort();
  }, [loadProjects]);

  const group = useMemo<ResearchGroupModel | undefined>(
    () => buildResearchGroups(projects).find((item) => item.slug === groupSlug),
    [groupSlug, projects],
  );

  useEffect(() => {
    if (!group?.projects.length) return;
    let active = true;

    Promise.all(
      group.projects.map(async (project) => {
        const id = project._id ?? project.slug;
        if (!id) return null;
        const count = await fetchProjectViewCount(id);
        return [id, count] as const;
      }),
    ).then((entries) => {
      if (!active) return;
      setViewCounts(Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, number]>));
    });

    return () => {
      active = false;
    };
  }, [group]);

  const openProject = async (project: any) => {
    const id = project?._id ?? project?.slug;
    if (id) {
      try {
        const count = await trackProjectView(id);
        if (count !== null) setViewCounts((current) => ({ ...current, [id]: count }));
      } catch {
        // Article navigation should not be blocked by analytics failures.
      }
    }
    navigate(`/projects/${project.slug || project._id}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {group && (
        <section
          data-hero-section
          className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-black text-white md:min-h-0 md:aspect-[16/5]"
        >
          <HeroVideo src={heroVideoForGroup(group)} />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              {group.type}
            </p>
            <h1 className="mx-auto max-w-5xl text-[34px] font-semibold leading-[1.05] text-white sm:text-[44px] md:text-[68px]">
              {group.name}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-[14px] leading-6 text-white/75 md:text-[17px]">
              Explore the latest research, projects, and ideas developed within {group.name}.
            </p>
          </div>
        </section>
      )}

      <TopPageNav />

      <main className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1500px]">
          <Link
            to="/research"
            className="mb-10 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-black/60 hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" /> Back to research groups
          </Link>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-[180px_1fr]">
              <div className="h-28 w-28 animate-pulse bg-black/10" />
              <div className="space-y-4">
                <div className="h-4 w-40 animate-pulse bg-black/10" />
                <div className="h-12 max-w-2xl animate-pulse bg-black/10" />
                <div className="h-4 max-w-3xl animate-pulse bg-black/10" />
              </div>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-700">
              Unable to load this research group.{' '}
              <button type="button" className="underline" onClick={loadProjects}>Retry</button>
            </div>
          ) : !group ? (
            <section className="py-20 text-center">
              <h1 className="mb-4 text-3xl font-semibold text-black">Research group not found</h1>
              <p className="mb-7 text-black/55">The selected group may have been renamed or removed.</p>
              <Link to="/research" className="font-semibold underline">Return to Research</Link>
            </section>
          ) : (
            <>
              <section className="grid gap-8 border-b border-black/10 pb-14 md:grid-cols-[150px_1fr] md:items-start md:pb-20">
                <GroupLogo name={group.name} />
                <div>
                  <div className="mb-5 flex items-center gap-3 text-[#d90000]">
                    {group.type === 'Working Group'
                      ? <Layers3 className="h-5 w-5" />
                      : <Sparkles className="h-5 w-5" />}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                      {group.type}
                    </span>
                  </div>
                  <h1 className="mb-6 max-w-5xl text-[38px] font-semibold leading-[1.03] text-black md:text-[68px]">
                    {group.name}
                  </h1>
                  <p className="max-w-4xl text-[16px] leading-8 text-black/60 md:text-[18px]">
                    {group.description}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    {group.tags.map((tag) => (
                      <span key={tag} className="border border-black/15 px-3 py-1.5 text-[12px] text-black/55">
                        #{String(tag).replace(/^#/, '')}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="py-14 md:py-20">
                <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d90000]">
                      Inside this group
                    </p>
                    <h2 className="text-[31px] font-semibold leading-none text-black md:text-[44px]">
                      Latest research
                    </h2>
                  </div>
                  <p className="max-w-lg text-[14px] leading-6 text-black/55 md:text-right">
                    {group.projects.length} {group.projects.length === 1 ? 'published article' : 'published articles'} from {group.name}.
                  </p>
                </div>

                <div className="grid grid-cols-1 border-l border-t border-black/10 md:grid-cols-2 xl:grid-cols-4">
                  {group.projects.map((project) => {
                    const id = project._id ?? project.slug;
                    return (
                      <ResearchArticleCard
                        key={id}
                        project={project}
                        viewCount={viewCounts[id] ?? 0}
                        onOpen={() => openProject(project)}
                      />
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
