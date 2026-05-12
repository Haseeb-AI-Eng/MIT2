import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { NewsCard } from '../components/NewsCard';
import { HeroVideo } from './HeroVideo'; // Fixed path: HeroVideo is in the same folder as Home.tsx
import { fetchPublishedProjects } from '../api';

export const Home = React.memo(function Home() {
  const navigate = useNavigate();
  const [publishedProjects, setPublishedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublishedProjects(50, 1)
      .then((publishedResponse) => {
        setPublishedProjects(publishedResponse.projects || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleProjectClick = useCallback(
    (slug: string | undefined, id: string | undefined) => {
      navigate(`/projects/${slug || id}`);
    },
    [navigate]
  );

  return (
    <div>
      <section
        data-hero-section
        className="relative bg-black text-white aspect-auto md:aspect-[16/5] min-h-[62vh] md:min-h-0 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <HeroVideo /> {/* Use the new HeroVideo component here */}
        </div>
        <div className="relative w-full max-w-[90vw] px-4 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative w-full text-[24px] sm:text-[32px] md:text-[56px] text-center leading-[1.05] sm:leading-tight px-0 md:px-8 max-w-full md:max-w-none z-10 font-sans font-semibold"
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", fontWeight: 500 }}
          >
            Imagine what we can become.
          </motion.h1>
        </div>
      </section>

      <section className="lg:ml-80 px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        <div className="mb-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
            <p className="text-[12px] uppercase tracking-[0.24em] text-black/40">
              Latest Research
            </p>
            {!loading && (
              <p className="text-[14px] text-black/50">{publishedProjects.length} projects shown</p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-black/5 h-64 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-red-600">Could not fetch latest projects.</div>
          ) : publishedProjects.length === 0 ? (
            <div className="text-black/60">No published projects are available yet.</div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 auto-rows-fr"
              style={{ margin: 0 }}
            >
              {publishedProjects.map((project) => (
                <div key={project._id ?? project.slug} style={{ padding: 0 }}>
                  <NewsCard
                    image={project.coverImage || project.cover_image || ''}
                    title={project.title}
                    description={project.description}
                    category={project.tags?.[0] || 'Research'}
                    onClick={() => handleProjectClick(project.slug, project._id)}
                    aspect="normal"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

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