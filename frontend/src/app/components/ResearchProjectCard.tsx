import { motion } from 'motion/react';
import { Eye, Play, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export type ResearchProjectCardType =
  | 'featured'
  | 'standard'
  | 'text'
  | 'video'
  | 'statistic'
  | 'category';

interface ResearchProjectCardProps {
  project: any;
  cardType: ResearchProjectCardType;
  viewCount?: number;
  onClick?: () => void;
}

function formatDate(raw?: string | number | null) {
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatTiles(project: any, viewCount: number) {
  const teamCount = project.teamCount ?? project.team?.length ?? 0;
  const status = project.status ? String(project.status) : 'Published';
  return [
    { label: 'Status', value: status },
    { label: 'Team', value: `${teamCount} member${teamCount === 1 ? '' : 's'}` },
    { label: 'Views', value: `${viewCount ?? 0}` },
  ];
}

function buildTags(project: any) {
  if (Array.isArray(project.tags) && project.tags.length > 0) {
    return project.tags.filter(Boolean).slice(0, 3);
  }
  if (project.category) return [String(project.category)];
  return ['Research'];
}

function getCardLabel(project: any) {
  const category = Array.isArray(project.tags) && project.tags.length > 0
    ? String(project.tags[0])
    : project.category || 'Research';
  return category;
}

export function ResearchProjectCard({
  project,
  cardType,
  viewCount = 0,
  onClick,
}: ResearchProjectCardProps) {
  const image = project.coverImage || project.cover_image || project.image || '';
  const title = project.title || 'Untitled research project';
  const description = project.description || project.excerpt || project.summary || '';
  const category = getCardLabel(project);
  const dateLabel = formatDate(project.publishedAt || project.createdAt || project.updatedAt);
  const statTiles = getStatTiles(project, viewCount);
  const tags = buildTags(project);
  const statusLabel = project.status ? String(project.status) : 'Published';

  const cardBase =
    'group cursor-pointer overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.12)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cardBase}
      onClick={onClick}
    >
      {(cardType === 'featured' || cardType === 'standard' || cardType === 'video') && (
        <div className="relative overflow-hidden bg-slate-100">
          <ImageWithFallback
            src={image}
            alt={title}
            className="w-full h-full min-h-[280px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {cardType === 'video' && (
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-lg">
              <Play size={24} className="ml-1" />
            </div>
          )}
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.3em] text-slate-900 shadow-sm">
            {category}
          </div>
        </div>
      )}

      <div className={`p-6 ${cardType === 'text' ? 'pt-8 pb-8' : ''}`}>
        {cardType === 'featured' && (
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-white">
              {statusLabel}
            </span>
            {dateLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-700">
                {dateLabel}
              </span>
            )}
          </div>
        )}

        {cardType === 'category' ? (
          <div className="space-y-4">
            <div className="text-[12px] uppercase tracking-[0.35em] text-slate-500">Research categories</div>
            <div className="grid gap-3">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] font-semibold text-slate-900 shadow-sm"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
        ) : cardType === 'statistic' ? (
          <div className="space-y-5">
            <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">Project snapshot</div>
            <div className="grid gap-4 sm:grid-cols-3">
              {statTiles.map((stat) => (
                <div key={stat.label} className="rounded-3xl bg-slate-950/95 px-5 py-6 text-white shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
                  <div className="text-[13px] uppercase tracking-[0.35em] text-slate-400">{stat.label}</div>
                  <div className="mt-3 text-[22px] font-semibold leading-tight">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="text-[11px] uppercase tracking-[0.35em] text-slate-500">{cardType === 'text' ? 'Research highlight' : 'Project'}</div>
              {dateLabel && <div className="text-[11px] uppercase tracking-[0.35em] text-slate-400">{dateLabel}</div>}
            </div>
            <h3 className={`font-sans text-slate-950 ${cardType === 'featured' ? 'text-[28px] md:text-[32px]' : 'text-[22px]'} font-semibold leading-tight mb-3`}>
              {title}
            </h3>
            {cardType !== 'video' && description && (
              <p className="text-[15px] leading-[1.75] text-slate-700 mb-5 line-clamp-4">
                {description}
              </p>
            )}
            {cardType === 'video' && (
              <p className="text-[14px] leading-[1.75] text-slate-600 mb-5">
                Watch the project demo, summary, or preview to explore the research in motion.
              </p>
            )}
            {cardType === 'text' && (
              <div className="text-[14px] leading-[1.75] text-slate-700">
                {description || 'A short summary that highlights the core idea without relying on imagery.'}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-[12px] uppercase tracking-[0.28em] text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </>
        )}

        {cardType !== 'category' && cardType !== 'statistic' && (
          <div className="mt-5 flex items-center justify-between gap-4 text-slate-500">
            <div className="flex items-center gap-2 text-[13px]">
              <Eye size={16} />
              <span>{viewCount ?? 0} views</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
              Explore
              <ArrowRight size={16} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
