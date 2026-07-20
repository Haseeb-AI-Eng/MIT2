import { useMemo, useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchArticleBySlug, fetchRelatedArticles } from '../api';
import { researchProjects } from '../data/researchProjects';

// ── Known section headings ──────────────────────────────────────────────────
// When an editor pastes a full article (abstract, introduction, etc.) into a
// single flat description/content string with no line breaks, these section
// words end up glued directly onto the sentence that follows them (e.g.
// "...research opportunities Abstract This article contextualizes...").
// This list lets us recognize those words and promote them to real headings.
const KNOWN_HEADINGS = [
  'Abstract',
  'Introduction',
  'Background',
  'Literature Review',
  'Methodology',
  'Methods',
  'Method',
  'Results',
  'Findings',
  'Discussion',
  'Conclusion',
  'Conclusions',
  'Recommendations',
  'Summary',
  'References',
];

// Matches a known heading word only when it's immediately followed by the
// start of a new sentence (a capital letter) — this is what tells us it's
// actually functioning as a heading rather than just appearing mid-sentence
// (e.g. "the abstract nature of the problem" shouldn't split).
const HEADING_SPLIT_REGEX = new RegExp(
  `\\b(${KNOWN_HEADINGS.join('|')})\\b(?=\\s+[A-Z])`,
  'g'
);

// ── Paragraph splitting ─────────────────────────────────────────────────────
// Tries real paragraph breaks first, then single line breaks, then falls
// back to grouping sentences (roughly 3 per paragraph) so a totally flat
// block of text still reads like normal prose instead of one dense wall.
function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];

  const doubleBreak = text
    .split(/\r?\n\s*\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (doubleBreak.length > 1) return doubleBreak;

  const singleBreak = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (singleBreak.length > 1) return singleBreak;

  const sentences = text.match(/[^.!?]+[.!?]+(?:\s+|$)/g) || [text];
  const SENTENCES_PER_PARAGRAPH = 3;
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += SENTENCES_PER_PARAGRAPH) {
    paragraphs.push(
      sentences
        .slice(i, i + SENTENCES_PER_PARAGRAPH)
        .join(' ')
        .trim()
    );
  }
  return paragraphs.filter(Boolean);
}

interface ArticleSection {
  heading: string | null;
  paragraphs: string[];
}

// Splits a raw text blob into { heading, paragraphs } sections wherever a
// known heading word is detected. Text before the first heading (e.g. a
// subtitle/summary line) becomes an untitled leading section.
function parseArticleSections(rawText: string): ArticleSection[] {
  if (!rawText) return [];
  const text = rawText.trim();
  if (!text) return [];

  const headingMatches: { heading: string; index: number }[] = [];
  const regex = new RegExp(HEADING_SPLIT_REGEX);
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    headingMatches.push({ heading: m[1], index: m.index });
    if (m.index === regex.lastIndex) regex.lastIndex += 1;
  }

  if (headingMatches.length === 0) {
    return [{ heading: null, paragraphs: splitIntoParagraphs(text) }];
  }

  const sections: ArticleSection[] = [];

  const introText = text.slice(0, headingMatches[0].index).trim();
  if (introText) {
    sections.push({ heading: null, paragraphs: splitIntoParagraphs(introText) });
  }

  for (let i = 0; i < headingMatches.length; i++) {
    const { heading, index } = headingMatches[i];
    const contentStart = index + heading.length;
    const contentEnd =
      i + 1 < headingMatches.length ? headingMatches[i + 1].index : text.length;
    const sectionText = text.slice(contentStart, contentEnd).trim();
    sections.push({ heading, paragraphs: splitIntoParagraphs(sectionText) });
  }

  return sections;
}

// Flattens a list of already-structured paragraphs (e.g. article.content as
// an array) into sections too, in case any individual item still has a
// heading glued onto it (e.g. one array entry equals "Abstract This article...").
function sectionsFromParagraphList(items: string[]): ArticleSection[] {
  const sections: ArticleSection[] = [];
  for (const item of items) {
    const parsed = parseArticleSections(item);
    for (const section of parsed) {
      // Merge consecutive untitled sections into the previous untitled one
      // so structured content doesn't get needlessly fragmented.
      const last = sections[sections.length - 1];
      if (!section.heading && last && !last.heading) {
        last.paragraphs.push(...section.paragraphs);
      } else {
        sections.push(section);
      }
    }
  }
  return sections;
}

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

  // Decide whether `article.description` is a genuinely separate summary
  // line (show it above as a subtitle) or whether it's the same blob as
  // the main content (in which case showing it twice would duplicate text).
  const { subtitle, contentSections } = useMemo<{ subtitle: string | null; contentSections: ArticleSection[] }>(() => {
    if (!article) return { subtitle: null, contentSections: [] };

    const description = typeof article.description === 'string' ? article.description.trim() : '';

    if (Array.isArray(article.content) && article.content.length > 0) {
      const items = article.content.filter(
        (p: string) => typeof p === 'string' && p.trim().length > 0
      );
      return {
        subtitle: description || null,
        contentSections: sectionsFromParagraphList(items),
      };
    }

    const contentString = typeof article.content === 'string' ? article.content.trim() : '';

    if (contentString && contentString !== description) {
      return {
        subtitle: description || null,
        contentSections: parseArticleSections(contentString),
      };
    }

    // No distinct content — description (or contentString, if that's all
    // there is) IS the full article. Parse it for headings/paragraphs and
    // don't also show it as a separate subtitle above.
    const raw = contentString || description;
    return { subtitle: null, contentSections: parseArticleSections(raw) };
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
            {subtitle && (
              <p className="text-[18px] font-semibold text-black/80 mb-6">{subtitle}</p>
            )}

            <div className="space-y-8 text-[16px] text-black/80 leading-relaxed">
              {contentSections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-4">
                  {section.heading && (
                    <h2 className="text-[20px] md:text-[22px] font-bold text-black mt-2">
                      {section.heading}
                    </h2>
                  )}
                  {section.paragraphs.map((paragraph, pIdx) => (
                    <p key={pIdx} className="text-justify">
                      {paragraph}
                    </p>
                  ))}
                </div>
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