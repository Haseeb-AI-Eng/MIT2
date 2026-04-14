import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { NewsCard } from '../components/NewsCard';
import { EventCard } from '../components/EventCard';
import { fetchLatestArticles, fetchStats } from '../api';

interface Article {
  slug: string;
  id: string;
  title: string;
  category: string;
  date?: string;
  image: string;
  description: string;
  excerpt: string;
  content: string[];
}

function getArticle(list: Article[], index: number): Article | null {
  return list[index] || null;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastScraped, setLastScraped] = useState<string>('');
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    const loadArticles = () => {
      Promise.all([
        fetchLatestArticles(50),
        fetchStats(),
      ]).then(([data, stats]) => {
        // Only keep articles that have images
        const withImages = data.filter((a: Article) => a.image && a.image.trim().length > 0);
        setArticles(withImages);
        setTotalArticles(stats.totalArticles);
        if (stats.lastScraped) {
          const d = new Date(stats.lastScraped);
          setLastScraped(d.toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
            hour: 'numeric', minute: '2-digit', hour12: true,
          }));
        }
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    };

    loadArticles();
    // Auto-refresh every 20 seconds
    const interval = setInterval(loadArticles, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black/40 text-[16px]">Loading articles...</div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-black/40 text-[16px] mb-4">No articles found.</p>
          <p className="text-black/30 text-[14px]">The scraper is running. Check back soon or trigger a scrape manually.</p>
        </div>
      </div>
    );
  }

  const a = getArticle;

  return (
    <div>
      <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/image.gif"
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-[36px] md:text-[56px] text-center px-8 leading-tight z-10"
          style={{ fontFamily: "'Times New Roman', Georgia, serif", fontWeight: 300 }}
        >
          Imagine what we can become.
        </motion.h1>
      </section>

      {/* Live data indicator */}
      {lastScraped && (
        <div className="lg:ml-80 px-4 md:px-8 pt-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 text-[12px] text-black/40">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live from MIT News
            </span>
            <span>•</span>
            <span>Auto-refreshes every 20s</span>
            <span>•</span>
            <span>Last updated: {lastScraped}</span>
          </div>
        </div>
      )}

      <section className="lg:ml-80 px-4 md:px-8 py-8 max-w-[1400px] mx-auto">
        {/* Row 1: Large + Event */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {a(articles, 0) && (
            <NewsCard
              image={a(articles, 0)!.image || ''}
              title={a(articles, 0)!.title}
              description={a(articles, 0)!.description || a(articles, 0)!.excerpt || ''}
              category={a(articles, 0)!.category || 'News'}
              size="large"
              onClick={() => navigate(`/article/${a(articles, 0)!.slug}`)}
            />
          )}
          {a(articles, 1) && (
            <EventCard
              image={a(articles, 1)!.image || ''}
              title={a(articles, 1)!.title}
              date={formatDate(a(articles, 1)!.date)}
              tag={a(articles, 1)!.category || 'Event'}
              onClick={() => navigate(`/article/${a(articles, 1)!.slug}`)}
            />
          )}
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
          <div className="md:col-span-4">
            {a(articles, 2) && (
              <NewsCard
                image={a(articles, 2)!.image || ''}
                title={a(articles, 2)!.title}
                description={a(articles, 2)!.description || ''}
                category={a(articles, 2)!.category || 'News'}
                onClick={() => navigate(`/article/${a(articles, 2)!.slug}`)}
              />
            )}
          </div>
          <div className="md:col-span-5">
            {a(articles, 3) && (
              <NewsCard
                image={a(articles, 3)!.image || ''}
                title={a(articles, 3)!.title}
                description={a(articles, 3)!.description || a(articles, 3)!.excerpt || ''}
                category={a(articles, 3)!.category || 'Research'}
                size="large"
                onClick={() => navigate(`/article/${a(articles, 3)!.slug}`)}
              />
            )}
          </div>
          <div className="md:col-span-3 space-y-5">
            {a(articles, 4) && (
              <NewsCard
                image={a(articles, 4)!.image || ''}
                title={a(articles, 4)!.title}
                category={a(articles, 4)!.category || 'News'}
                onClick={() => navigate(`/article/${a(articles, 4)!.slug}`)}
              />
            )}
            {a(articles, 5) && (
              <NewsCard
                image={a(articles, 5)!.image || ''}
                title={a(articles, 5)!.title}
                category={a(articles, 5)!.category || 'Research'}
                onClick={() => navigate(`/article/${a(articles, 5)!.slug}`)}
              />
            )}
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {a(articles, 6) && (
            <NewsCard
              image={a(articles, 6)!.image || ''}
              title={a(articles, 6)!.title}
              description={a(articles, 6)!.description || ''}
              category={a(articles, 6)!.category || 'Research'}
              onClick={() => navigate(`/article/${a(articles, 6)!.slug}`)}
            />
          )}
          {a(articles, 7) && (
            <NewsCard
              image={a(articles, 7)!.image || ''}
              title={a(articles, 7)!.title}
              description={a(articles, 7)!.description || ''}
              category={a(articles, 7)!.category || 'Research'}
              onClick={() => navigate(`/article/${a(articles, 7)!.slug}`)}
            />
          )}
          {a(articles, 8) && (
            <NewsCard
              image={a(articles, 8)!.image || ''}
              title={a(articles, 8)!.title}
              description={a(articles, 8)!.description || ''}
              category={a(articles, 8)!.category || 'Event'}
              onClick={() => navigate(`/article/${a(articles, 8)!.slug}`)}
            />
          )}
        </div>

        {/* Featured Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {a(articles, 9) && (
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/article/${a(articles, 9)!.slug}`)}
            >
              <div className="overflow-hidden">
                <img
                  src={a(articles, 9)!.image || ''}
                  alt={a(articles, 9)!.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 9)!.category}</p>
                <h3 className="text-[22px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                  {a(articles, 9)!.title}
                </h3>
                <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                  {a(articles, 9)!.description || a(articles, 9)!.excerpt || ''}
                </p>
              </div>
            </div>
          )}

          <div className="col-span-1 flex flex-col gap-5">
            {a(articles, 10) && (
              <div className="flex flex-col">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/article/${a(articles, 10)!.slug}`)}
                >
                  <div className="overflow-hidden aspect-square">
                    <img
                      src={a(articles, 10)!.image || ''}
                      alt={a(articles, 10)!.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 10)!.category}</p>
                    <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                      {a(articles, 10)!.title}
                    </h3>
                    <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                      {a(articles, 10)!.description || a(articles, 10)!.excerpt || ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {a(articles, 11) && (
              <div className="flex flex-col">
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/article/${a(articles, 11)!.slug}`)}
                >
                  <div className="overflow-hidden aspect-square">
                    <img
                      src={a(articles, 11)!.image || ''}
                      alt={a(articles, 11)!.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 11)!.category}</p>
                    <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                      {a(articles, 11)!.title}
                    </h3>
                    <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                      {a(articles, 11)!.description || a(articles, 11)!.excerpt || ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2 Images with descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          {a(articles, 12) && (
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/article/${a(articles, 12)!.slug}`)}
            >
              <div className="overflow-hidden mb-4">
                <img
                  src={a(articles, 12)!.image || ''}
                  alt={a(articles, 12)!.title}
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 12)!.category}</p>
              <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                {a(articles, 12)!.title}
              </h3>
              <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                {a(articles, 12)!.description || a(articles, 12)!.excerpt || ''}
              </p>
            </div>
          )}
          {a(articles, 13) && (
            <div
              className="cursor-pointer"
              onClick={() => navigate(`/article/${a(articles, 13)!.slug}`)}
            >
              <div className="overflow-hidden mb-4">
                <img
                  src={a(articles, 13)!.image || ''}
                  alt={a(articles, 13)!.title}
                  className="w-full aspect-[4/3] object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 13)!.category}</p>
              <h3 className="text-[20px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                {a(articles, 13)!.title}
              </h3>
              <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                {a(articles, 13)!.description || a(articles, 13)!.excerpt || ''}
              </p>
            </div>
          )}
        </div>

        {/* Masonry section */}
        <section className="mb-5">
          <div className="columns-2 md:columns-3 lg:columns-4 gap-5 space-y-5">
            {a(articles, 14) && (
              <div
                className="cursor-pointer break-inside-avoid"
                onClick={() => navigate(`/article/${a(articles, 14)!.slug}`)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={a(articles, 14)!.image || ''}
                    alt={a(articles, 14)!.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 14)!.category}</p>
                  <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                    {a(articles, 14)!.title}
                  </h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                    {a(articles, 14)!.description || a(articles, 14)!.excerpt || ''}
                  </p>
                </div>
              </div>
            )}
            {a(articles, 15) && (
              <div
                className="cursor-pointer break-inside-avoid"
                onClick={() => navigate(`/article/${a(articles, 15)!.slug}`)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={a(articles, 15)!.image || ''}
                    alt={a(articles, 15)!.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-3">
                  <p className="text-[11px] uppercase tracking-widest text-black/40 mb-2">{a(articles, 15)!.category}</p>
                  <h3 className="text-[18px] font-[500] mb-2 leading-tight font-serif transition-colors duration-200 hover:text-blue-600">
                    {a(articles, 15)!.title}
                  </h3>
                  <p className="text-[14px] text-black/60 leading-relaxed font-serif transition-colors duration-200 hover:text-blue-600">
                    {a(articles, 15)!.description || a(articles, 15)!.excerpt || ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bottom preview section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
          {[16, 17, 18].map(idx => {
            const article = a(articles, idx);
            if (!article) return null;
            return (
              <div
                key={article.slug}
                className="cursor-pointer"
                onClick={() => navigate(`/article/${article.slug}`)}
              >
                <div className="aspect-[4/3] overflow-hidden mb-4">
                  <img
                    src={article.image || ''}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600">
                  {article.description || article.excerpt || ''}
                </p>
                <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600">
                  {formatDate(article.date)}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
