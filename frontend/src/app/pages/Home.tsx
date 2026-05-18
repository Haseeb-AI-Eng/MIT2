import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { NewsCard } from '../components/NewsCard';
import { HeroVideo } from './HeroVideo';
import { fetchPublishedProjects } from '../api';

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

interface AssignedCard {
  project: any;
  role: CardRole;
  colSpan: number;
}

export const Home = React.memo(function Home() {
  const navigate = useNavigate();
  const [publishedProjects, setPublishedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedProjects(50, 1)
      .then((res) => setPublishedProjects(res.projects || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleProjectClick = useCallback(
    (slug: string | undefined, id: string | undefined) => {
      navigate(`/projects/${slug || id}`);
    },
    [navigate]
  );

  // Assign each project a role by walking through row patterns
  const assignedCards = useMemo<AssignedCard[]>(() => {
    const result: AssignedCard[] = [];
    let projectIdx = 0;
    let patternIdx = 0;

    while (projectIdx < publishedProjects.length) {
      const pattern = ROW_PATTERNS[patternIdx % ROW_PATTERNS.length];
      const remaining = publishedProjects.length - projectIdx;

      // If not enough projects to fill this pattern, fall back to normal cards
      if (remaining < pattern.roles.length) {
        for (let i = 0; i < remaining; i++) {
          result.push({
            project: publishedProjects[projectIdx++],
            role: 'normal',
            colSpan: 1,
          });
        }
        break;
      }

      // Assign roles from this pattern
      for (let i = 0; i < pattern.roles.length; i++) {
        result.push({
          project: publishedProjects[projectIdx++],
          role: pattern.roles[i],
          colSpan: pattern.cols[i],
        });
      }

      patternIdx++;
    }

    return result;
  }, [publishedProjects]);

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
            className="relative w-full text-[36px] sm:text-[40px] md:text-[40px] md:ml-30 leading-[1.05] sm:leading-tight px-0 md:px-8 max-w-full md:max-w-none z-10 font-sans font-semibold"
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
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/40">Latest Research</p>
            {!loading && (
              <p className="text-[14px] text-black/50">{publishedProjects.length} projects shown</p>
            )}
          </div>

          {/* ── Loading skeleton ── */}
          {loading && (
            <div className="grid grid-cols-3 gap-[3px]">
              <div className="col-span-2 animate-pulse bg-black/5" style={{ aspectRatio: '16/8' }} />
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
          {!loading && !error && publishedProjects.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[3px] items-start">
              {assignedCards.map(({ project, role, colSpan }, index) => (
                <motion.div
                  key={project._id ?? project.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: (index % 6) * 0.05 }}
                  // On mobile everything is 1 col; on sm 2-col; on lg use dynamic span
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
                    onClick={() => handleProjectClick(project.slug, project._id)}
                    size={role === 'wide' ? 'large' : role === 'side' ? 'medium' : 'medium'}
                    aspect={role === 'wide' ? 'wide' : role === 'side' ? 'side' : 'normal'}
                  />
                </motion.div>
              ))}
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