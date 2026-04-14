import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { findArticle } from '../data/articles';

const generateArticleBody = (article: { title: string; category: string; description: string; date?: string }) => {
  const title = article.title;
  const category = article.category;
  const description = article.description;
  const label = category.toLowerCase();

  const articleType = label.includes('event')
    ? 'event narrative'
    : label.includes('news')
    ? 'news story'
    : label.includes('community')
    ? 'community profile'
    : label.includes('innovation')
    ? 'innovation report'
    : 'research feature';

  return [
    `The piece is presented as a ${articleType} built around the visual and conceptual thread that appears in the hero image above. It invites the reader to follow the arc of the idea from early experimentation to a more coherent set of outcomes.`,
    `At the outset, the article frames its core question clearly: what does this work mean for the people who will use it, study it, or be influenced by it? That question is the anchor for the entire page.`,
    `This entry dives deep into ${description.toLowerCase()}. It describes the team’s process, the decisions that mattered, and the way the work interfaces with human behavior and real-world systems.`,
    `The narrative emphasizes how the project connects technical design with practical application. It describes the kinds of environments where the work was tested, the collaborators who shaped it, and the early feedback that guided iteration.`,
    `Because the Media Lab values interdisciplinary collaboration, the article also highlights the roles of designers, engineers, scientists, and community partners. Each paragraph shows how those contributions combine into a stronger whole.`,
    `The story is not just about a single breakthrough. It unpacks the supporting systems, the measurement strategy, and the research questions that still remain open. That detail helps readers understand both the ambition and the rigor behind the work.`,
    `As the reader moves through the page, the article consistently returns to the central idea: how this work can change the way we think about people, technology, and the future. That sense of purpose keeps the piece cohesive.`,
    `Later sections describe specific outcomes and possible next steps. They may explain how the project could expand to new settings, how it could inform future prototypes, or how it might shape policy and public conversation.`,
    `The article is careful to surface both promise and challenge. It notes where the current work is strong, where it requires more testing, and what the team has learned from early experiments. That honesty makes the detail feel credible.`,
    `There is also a strong visual through-line. The hero image above is referenced again in the text as a way to ground the reader in the project's mood, materials, and human-centered ambitions.`,
    `The piece includes reflections on how this research connects to broader Media Lab themes: creativity, equity, sustainability, and the ethics of emerging technology. Those reflections give the story context beyond the immediate project.`,
    `In its concluding paragraphs, the article looks ahead. It describes what the team plans to explore next, what questions are still unanswered, and how the work could influence other research areas or public conversations.`,
    `By the end of the detail page, readers should have a strong sense of what makes this project distinctive, how it was built, and why it matters. The longer body is designed to support both quick scanning and deeper reading.`,
    `The extended narrative is intentionally layered, so it can serve as both a polished showcase of the work and a practical account of the process behind it. That balance is what gives the page true depth.`
  ];
};

export function ArticleDetail() {
  const { id } = useParams();
  const article = useMemo(() => findArticle(id), [id]);
  const navigate = useNavigate();

  const detailContent = useMemo(() => {
    if (!article) return [];
    return [...article.content, ...generateArticleBody(article)];
  }, [article]);

  if (!article) {
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
      <div className="relative w-full aspect-[21/9] overflow-hidden">
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24">
          <p className="text-white text-sm font-semibold mb-3">Article</p>
          <h1 className="text-white text-[36px] md:text-[52px] font-bold leading-[1.1] max-w-4xl">
            {article.title}
          </h1>
        </div>
      </div>

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
          {article.category}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Sidebar */}
          <aside className="md:col-span-4 lg:col-span-3 border-t border-black/10 pt-8">
            <div className="text-sm text-black/70 leading-relaxed">
              {article.source && <p className="mb-1">{article.source}</p>}
              <p className="mb-1">By Rubina Veerakone</p>
              {article.date && <p className="text-black/50">{article.date}</p>}
            </div>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-8 lg:col-span-7">
            <div className="space-y-6 text-[16px] text-black/80 leading-relaxed font-serif">
              <p>{article.description}</p>
              {detailContent.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
