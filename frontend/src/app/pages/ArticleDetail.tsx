import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchArticleBySlug, fetchRelatedArticles } from '../api';
import { researchProjects } from '../data/researchProjects';

export function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);

    const localArticle = researchProjects.find((item) => item.slug === id);
    if (localArticle) {
      setArticle(localArticle);
      setRelated(researchProjects.filter((item) => item.slug !== id).slice(0, 4));
      setLoading(false);
      return;
    }

    fetchArticleBySlug(id).then(data => {
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setArticle(data);
      fetchRelatedArticles(id).then((items) => {
        if (items && items.length > 0) {
          setRelated(items);
        } else {
          setRelated(researchProjects.filter((item) => item.slug !== id).slice(0, 4));
        }
      });
      setLoading(false);
    }).catch(() => {
      setNotFound(true);
      setLoading(false);
    });
  }, [id]);

  const detailContent = useMemo(() => {
    if (!article) return [];

    if (Array.isArray(article.content)) {
      return article.content.filter((paragraph: string) => typeof paragraph === 'string' && paragraph.trim().length > 0);
    }

    if (typeof article.content === 'string' && article.content.trim().length > 0) {
      return [article.content.trim()];
    }

    if (typeof article.description === 'string' && article.description.trim().length > 0) {
      return [article.description.trim()];
    }

    return [];
  }, [article]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black/40 text-[16px]">Loading article...</div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="px-4 md:px-8 py-10 max-w-[900px] mx-auto">
        <p className="text-[18px] text-black/70 mb-6">Article not found.</p>
        <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">Return to home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        data-hero-section
        className="relative text-white flex items-center text-left"
        style={{
          minHeight: '260px',
          maxHeight: '360px',
          height: '28vw',
          backgroundColor: '#000',
          backgroundImage: article.image ? `url(${article.image})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-[28px] md:text-[44px] font-bold leading-tight px-6 max-w-4xl mx-auto"
        >
          {article.title}
        </motion.h1>
      </section>

      {/* Content Section */}
      <div className="flex min-h-[calc(100vh-280px)]">
        <aside
          className="hidden md:flex flex-col flex-shrink-0 border-r border-black/10"
          style={{ width: '260px', minWidth: '220px', padding: '2rem 1.5rem' }}
        >
          <Link
            to="/"
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            className="flex items-center gap-1 text-[13px] text-black/60 hover:text-black mb-6 transition-colors"
          >
            ‹ {article.category || 'News'}
          </Link>
          <div className="text-sm text-black/70 leading-relaxed">
            {article.source && <p className="mb-1">{article.source}</p>}
            <p className="mb-1">By Rubina Veerakone</p>
            {article.date && <p className="text-black/50">{article.date}</p>}
          </div>

          {related.length > 0 && (
            <div className="mt-8 pt-8 border-t border-black/10">
              <p className="text-[12px] font-semibold text-black/50 uppercase tracking-wide mb-4">Related</p>
              <div className="space-y-3">
                {related.map((r: any) => (
                  <Link
                    key={r.slug}
                    to={`/article/${r.slug}`}
                    onClick={(e) => { e.preventDefault(); navigate(`/article/${r.slug}`); }}
                    className="block group"
                  >
                    <p className="text-[13px] text-black/70 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {r.title}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="flex-1 px-6 py-12">
          <div className="max-w-[760px]">
            {article.description && <p className="text-[18px] font-semibold text-black/80 mb-6">{article.description}</p>}
            <div className="space-y-6 text-[16px] text-black/80 leading-relaxed">
              {detailContent.map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {article.articleUrl && (
              <div className="mt-12 pt-6 border-t border-black/10">
                <p className="text-[12px] text-black/30">
                  Source:{' '}
                  <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {article.articleUrl}
                  </a>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
