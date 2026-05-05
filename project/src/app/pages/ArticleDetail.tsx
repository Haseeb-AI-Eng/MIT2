import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchArticleBySlug, fetchRelatedArticles } from '../api';
import { researchProjects } from '../data/researchProjects';

const generateArticleBody = (article: { title: string; category: string; description: string; date?: string }) => {
  const label = article.category?.toLowerCase() || '';
  const articleType = label.includes('event') ? 'event narrative' : label.includes('news') ? 'news story' : 'research feature';

  return [
    `The piece is presented as a ${articleType} built around the visual and conceptual thread that appears in the hero image above.`,
    `At the outset, the article frames its core question clearly: what does this work mean for the people who will use it, study it, or be influenced by it?`,
    `This entry dives deep into ${article.description?.toLowerCase().slice(0, 120) || 'the research topic'}. It describes the team's process and the decisions that mattered most.`,
    `The narrative emphasizes how the project connects technical design with practical application in real-world systems.`,
    `Because the MIT Media Lab values interdisciplinary collaboration, the article highlights the roles of designers, engineers, scientists, and community partners.`,
    `The story is not just about a single breakthrough. It unpacks the supporting systems and research questions that still remain open.`,
    `As the reader moves through the page, the article consistently returns to the central idea of how this work can change the way we think about technology and the future.`,
    `Later sections describe specific outcomes and possible next steps, including how the project could expand to new settings.`,
    `The article is careful to surface both promise and challenge, noting where current work is strong and where it requires more testing.`,
    `The piece includes reflections on how this research connects to broader Media Lab themes: creativity, equity, sustainability, and the ethics of emerging technology.`,
    `In its concluding paragraphs, the article looks ahead to what the team plans to explore next.`,
    `By the end of the detail page, readers should have a strong sense of what makes this project distinctive and why it matters.`,
  ];
};

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
    let body: string[] = [];
    // Handle both array and string content (old DB entries may have string)
    if (Array.isArray(article.content)) {
      body = article.content.filter((p: string) => p && p.length > 10);
    } else if (typeof article.content === 'string' && article.content.length > 10) {
      body = [article.content];
    }
    const filler = generateArticleBody(article);
    return [...body, ...filler];
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
      <section className="relative bg-black text-white aspect-[16/5] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {article.image && (
            <img src={article.image} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-[36px] md:text-[56px] text-center px-8 leading-tight z-10 font-sans font-bold max-w-5xl"
        >
          {article.title}
        </motion.h1>
      </section>

      {/* Content Section */}
      <div className="lg:ml-80 px-4 md:px-8 lg:px-16 py-12 max-w-[1000px]">
        {/* Back Link + Category */}
        <Link
          to="/"
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          className="inline-flex items-center gap-2 text-[14px] text-black/60 hover:text-black transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          {article.category || 'News'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 border-t border-black/10 pt-8">
            <div className="text-sm text-black/70 leading-relaxed">
              {article.source && <p className="mb-1">{article.source}</p>}
              <p className="mb-1">By Rubina Veerakone</p>
              {article.date && <p className="text-black/50">{article.date}</p>}
            </div>

            {/* Related Articles */}
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

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-7">
            <div className="space-y-6 text-[16px] text-black/80 leading-relaxed font-serif">
              {article.description && <p className="font-semibold">{article.description}</p>}
              {detailContent.map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Article URL source */}
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
        </div>
      </div>
    </div>
  );
}
