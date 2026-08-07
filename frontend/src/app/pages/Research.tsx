import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, Layers3, Sparkles } from 'lucide-react';
import {
  dedupeProjectList,
  fetchProjectViewCount,
  fetchPublishedProjects,
  trackProjectView,
} from '../api';
import { TopPageNav } from '../components/TopPageNav';
import { HeroVideo } from './HeroVideo';
import {
  buildResearchGroups,
  cleanResearchText,
  makeResearchGroupMonogram,
  projectTimestamp,
  type GroupType,
  type ResearchGroupModel,
} from '../utils/researchGroups';

const cyclingWords = ['#health', '#design', '#AI', '#robotics', '#education'];
const PAGE_SIZE = 48;

function GroupLogo({ name }: { name: string }) {
  return (
    <div className="relative h-[78px] w-[78px] shrink-0 border-[5px] border-black bg-white">
      <div className="absolute left-[15px] top-[15px] h-[38px] w-[38px] bg-black" />
      <div className="absolute left-[25px] top-[25px] h-[18px] w-[18px] bg-white" />
      <span className="absolute bottom-1 right-1 text-[10px] font-bold tracking-tight text-black">
        {makeResearchGroupMonogram(name)}
      </span>
    </div>
  );
}

function ResearchGroupCard({
  group,
  onOpen,
}: {
  group: ResearchGroupModel;
  onOpen: (group: ResearchGroupModel) => void;
}) {

  return (
    <article className="group flex min-h-[330px] flex-col border-b border-r border-black/10 bg-white p-7 md:p-8">
      <div className="mb-7 flex items-start gap-5">
        <GroupLogo name={group.name} />
        <div className="min-w-0 pt-1">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-black/45">
            {group.type}
          </p>
          <h3 className="text-[19px] font-semibold leading-[1.15] text-black md:text-[21px]">
            {group.name}
          </h3>
        </div>
      </div>

      <p className="mb-5 text-[14px] leading-6 text-black/60">{group.description}</p>

      <div className="mb-6 flex flex-wrap gap-x-2 gap-y-1 text-[12px] text-black/40">
        {group.tags.slice(0, 3).map((tag) => (
          <span key={tag}>#{String(tag).replace(/^#/, '')}</span>
        ))}
        {group.tags.length > 3 && <span>+{group.tags.length - 3} more</span>}
      </div>

      <div className="mt-auto border-t border-black/10 pt-5">
        <p className="mb-4 text-[12px] text-black/45">
          {group.projects.length} {group.projects.length === 1 ? 'research article' : 'research articles'}
        </p>
        <button
          type="button"
          onClick={() => onOpen(group)}
          className="flex w-full items-center justify-between gap-4 text-left text-[12px] font-semibold uppercase tracking-[0.14em] text-black"
          aria-label={`Open ${group.name} research group`}
        >
          <span>Explore group</span>
          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

function ArticleCard({
  project,
  viewCount,
  onOpen,
}: {
  project: any;
  viewCount: number;
  onOpen: () => void;
}) {
  const tags = Array.isArray(project.tags) ? project.tags.slice(0, 3) : [];

  return (
    <article className="group flex min-h-[300px] flex-col border-b border-r border-black/10 bg-white p-7">
      <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
        Research article
      </p>
      <h3 className="mb-4 text-[19px] font-semibold leading-[1.25] text-black">
        {project.title}
      </h3>
      <p className="mb-5 text-[14px] leading-6 text-black/55">
        {cleanResearchText(project.description || project.summary || '', 145)}
      </p>
      <div className="mb-6 flex flex-wrap gap-2 text-[12px] text-black/40">
        {tags.map((tag: string) => (
          <span key={tag}>#{String(tag).replace(/^#/, '')}</span>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-4">
        <span className="flex items-center gap-1.5 text-[12px] text-black/40">
          <Eye className="h-3.5 w-3.5" /> {viewCount}
        </span>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.13em] text-black"
        >
          Read article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </article>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 border-l border-t border-black/10 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="min-h-[360px] animate-pulse border-b border-r border-black/10 p-8">
          <div className="mb-8 flex gap-5">
            <div className="h-[78px] w-[78px] bg-black/10" />
            <div className="flex-1 space-y-3 pt-2">
              <div className="h-3 w-1/2 bg-black/10" />
              <div className="h-5 w-4/5 bg-black/10" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-3 bg-black/10" />
            <div className="h-3 bg-black/10" />
            <div className="h-3 w-3/4 bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Research() {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [fade, setFade] = useState(true);
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
      const data = await fetchPublishedProjects(PAGE_SIZE, 1, controller.signal);
      setProjects(dedupeProjectList(data.projects || []));
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

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFade(false);
      window.setTimeout(() => {
        setWordIndex((index) => (index + 1) % cyclingWords.length);
        setFade(true);
      }, 300);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!projects.length) return;

    let active = true;
    Promise.all(
      projects.slice(0, 16).map(async (project) => {
        const id = project._id ?? project.slug;
        if (!id) return null;
        const count = await fetchProjectViewCount(id);
        return [id, count] as const;
      }),
    ).then((entries) => {
      if (!active) return;
      setViewCounts(
        Object.fromEntries(entries.filter(Boolean) as Array<readonly [string, number]>),
      );
    });

    return () => {
      active = false;
    };
  }, [projects]);

  const groups = useMemo(() => buildResearchGroups(projects), [projects]);
  const workingGroups = groups.filter((group) => group.type === 'Working Group');
  const focusGroups = groups.filter((group) => group.type === 'Focus Group');
  const latestArticles = useMemo(
    () => [...projects].sort((a, b) => projectTimestamp(b) - projectTimestamp(a)).slice(0, 8),
    [projects],
  );

  const openGroup = (group: ResearchGroupModel) => {
    navigate(`/research/groups/${group.slug}`);
  };

  const openProject = async (project: any) => {
    if (!project) return;
    const id = project._id ?? project.slug;
    if (id) {
      try {
        const count = await trackProjectView(id);
        if (count !== null) setViewCounts((current) => ({ ...current, [id]: count }));
      } catch {
        // Navigation should still work if analytics is unavailable.
      }
    }
    navigate(`/projects/${project.slug || project._id}`);
  };

  const renderGroupSection = (title: GroupType, items: ResearchGroupModel[], icon: 'layers' | 'sparkles') => {
    if (!items.length) return null;

    return (
      <section className="border-b border-black/10 py-14 md:py-20">
        <div className="mb-9 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[#d90000]">
              {icon === 'layers' ? <Layers3 className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Research groups</span>
            </div>
            <h2 className="text-[31px] font-semibold leading-none text-black md:text-[44px]">{title}s</h2>
          </div>
          <p className="max-w-xl text-[14px] leading-6 text-black/55 md:text-right">
            {title === 'Working Group'
              ? 'Long-running interdisciplinary teams that develop sustained research programs, tools, and platforms.'
              : 'Targeted collaborations formed around an emerging question, opportunity, or shared area of investigation.'}
          </p>
        </div>

        <div className="grid grid-cols-1 border-l border-t border-black/10 md:grid-cols-2 xl:grid-cols-4">
          {items.map((group) => (
            <ResearchGroupCard key={group.key} group={group} onOpen={openGroup} />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <section
        data-hero-section
        className="relative flex min-h-[50vh] items-center justify-center overflow-hidden bg-black text-white md:min-h-0 md:aspect-[16/5]"
      >
        <div className="absolute inset-0">
          <HeroVideo src="/research-hero.mp4" />
        </div>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-6 text-center">
          <p className="mb-4 text-[12px] uppercase tracking-[0.35em] text-white/60">EI research</p>
          <h1 className="mx-auto max-w-4xl text-[24px] font-semibold leading-tight sm:text-[28px] md:text-[52px] md:leading-[1.1]">
            We are an interdisciplinary research lab working to invent the future of{' '}
            <span
              className="inline-block text-[#FF0000] transition-opacity duration-300"
              style={{ opacity: fade ? 1 : 0 }}
            >
              {cyclingWords[wordIndex]}
            </span>
          </h1>
        </div>
      </section>

      <TopPageNav />

      <main className="px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1500px]">
          <section className="mb-14 grid gap-8 border-b border-black/10 pb-12 md:grid-cols-[1.1fr_0.9fr] md:items-end md:pb-16">
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d90000]">
                How research is organized
              </p>
              <h2 className="max-w-4xl text-[30px] font-semibold leading-[1.08] text-black md:text-[52px]">
                Research is organized into groups—not a flat list of articles.
              </h2>
            </div>
            <p className="max-w-xl text-[15px] leading-7 text-black/60 md:justify-self-end">
              Every Working Group and Focus Group brings people together around a shared research direction. Each group highlights its newest published research, while the complete article collection remains available below.
            </p>
          </section>

          {loading ? (
            <LoadingGrid />
          ) : error ? (
            <div className="py-20 text-center text-red-700">
              Unable to load research groups.{' '}
              <button type="button" className="underline" onClick={loadProjects}>Retry</button>
            </div>
          ) : !projects.length ? (
            <div className="py-20 text-center text-black/55">
              No published research is available yet.
            </div>
          ) : (
            <>
              {renderGroupSection('Working Group', workingGroups, 'layers')}
              {renderGroupSection('Focus Group', focusGroups, 'sparkles')}

              <section className="py-14 md:py-20">
                <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d90000]">
                      Across all groups
                    </p>
                    <h2 className="text-[31px] font-semibold leading-none text-black md:text-[44px]">
                      Latest research articles
                    </h2>
                  </div>
                  <p className="max-w-lg text-[14px] leading-6 text-black/55 md:text-right">
                    The newest work published by our Working Groups and Focus Groups.
                  </p>
                </div>

                <div className="grid grid-cols-1 border-l border-t border-black/10 md:grid-cols-2 xl:grid-cols-4">
                  {latestArticles.map((project) => {
                    const id = project._id ?? project.slug;
                    return (
                      <ArticleCard
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
