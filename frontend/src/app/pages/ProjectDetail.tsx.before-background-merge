import { useState, useEffect, Fragment } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { fetchProjectByIdOrSlug } from '../api';

function formatDate(dateValue: string | Date | undefined) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitials(name: string) {
  return name
    ?.split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2) || 'U';
}

function makeLogoText(text: string) {
  const parts = text
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase());
  return parts.slice(0, 2).join('') || text.slice(0, 2).toUpperCase();
}

function normalizeProjectReferences(project: any): string[] {
  const values = [] as string[];
  const preferredFields = [
    'references',
    'articles',
    'sources',
    'bibliography',
    'citations',
  ];

  for (const field of preferredFields) {
    const item = project?.[field];
    if (!item) continue;
    if (Array.isArray(item)) {
      values.push(...item.filter(Boolean).map(String));
      break;
    }
    if (typeof item === 'string') {
      values.push(...item
        .split(/\r?\n|\s*\u2022\s*|;\s*/)
        .map((line) => line.trim())
        .filter(Boolean));
      break;
    }
  }

  return values;
}

// ── Fallback: pull references out of `description` itself ──────────────────
// Some projects don't have a dedicated references/bibliography field — the
// citation list was just pasted straight into the description, all as one
// run-on paragraph. This looks for the short "header" that typically opens
// an APA-style reference entry (e.g. "Bezemer, J., & Kress, G. (2008)." or
// "Elements Interactive. (n.d.).") and, if it finds at least two of them,
// treats everything from the first one onward as a references block and
// splits it into individual bullet entries. A single "(2024)." appearing in
// ordinary prose won't trigger this — it takes two or more to look like an
// actual reference list rather than a coincidental year in parentheses.
const CITATION_HEADER_REGEX = /[A-Z][A-Za-z.,&'’\-\s]{0,80}?\((?:\d{4}[a-z]?|n\.d\.)\)\./g;

function splitDescriptionReferences(description: string): { body: string; references: string[] } {
  if (!description) return { body: description || '', references: [] };

  const starts: number[] = [];
  const regex = new RegExp(CITATION_HEADER_REGEX);
  let match: RegExpExecArray | null;
  while ((match = regex.exec(description)) !== null) {
    starts.push(match.index);
    if (match.index === regex.lastIndex) regex.lastIndex += 1; // guard against zero-length matches
  }

  if (starts.length < 2) {
    return { body: description, references: [] };
  }

  const refStart = starts[0];
  const body = description.slice(0, refStart).trim();
  const references: string[] = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i];
    const end = i + 1 < starts.length ? starts[i + 1] : description.length;
    const entry = description.slice(start, end).trim();
    if (entry) references.push(entry);
  }

  return { body, references };
}

function extractUnseenGazeTitle(description: string) {
  const normalizeLine = (line: string) => line.replace(/^\s*#{1,6}\s*/, '').trim();
  const lines = description
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => normalizeLine(line.trim()))
    .filter(Boolean);

  if (lines.length >= 2) {
    const titleLine = lines[0];
    const subtitleLine = lines[1];
    const titleMatch = /^The Unseen Gaze:?$/i.test(titleLine);
    const subtitleMatch = /^Elements Interactive,\s*Pexels,\s*and Pakistan['’]s Digital Visual(?:\s+Narrative)?$/i.test(subtitleLine);
    if (titleMatch && subtitleMatch) {
      return {
        title: 'The Unseen Gaze; Elements Interactive, Pexels, and Pakistan’s Digital Visual',
        cleanedDescription: lines.slice(2).join('\n'),
      };
    }
  }

  return { title: null, cleanedDescription: description };
}

// Renders a block of text with any bare URLs turned into clickable links —
// used for reference entries, since citations often end in a raw link
// (e.g. "... https://doi.org/10.1080/...").
function linkifyText(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline break-all hover:text-blue-800"
      >
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

function parseProjectDescription(description: string) {
  if (!description) return [];

  const normalized = description.replace(/\r\n/g, '\n').trim();
  const rawBlocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const headingKeywords = new Set([
    'Narrative',
    'Abstract',
    'Introduction',
    'Community Service',
    'Background',
    'Conceptual Framework',
    'Visual Representation and Social Semiotics',
    'Nation Branding, Soft Power, and Platform Circulation',
    'Elements Interactive on Pexels as a Case Study',
    'Research Opportunities for Media Students',
    'Semiotic and Content Analysis',
    'Visual Nation Branding and Public Diplomacy',
    'Copyright, Licensing, and Digital Ethics',
    'Research Opportunities for Technology Students',
    'Metadata, APIs, and Data Collection',
    'Visual Trend Analysis and Dashboards',
    'Machine Learning and Computer Vision',
    'Methodology',
    'Methods',
    'Results',
    'Discussion',
    'Conclusion',
    'Summary',
    'Acknowledgements',
    'References',
    'Bibliography',
    'Findings',
    'Overview',
    'Implications',
    'Next Steps',
  ]);

  const headingPrefixRegex = new RegExp(`^(${[...headingKeywords].map((keyword) => keyword.replace(/[-/\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})(?:\s*:\s*|\s+)(.*)$`, 'i');
  const genericHeadingPrefixRegex = /^([A-Z][A-Za-z\s]{2,}?):\s*(.*)$/;
  const titleCaseHeadingRegex = /^[A-Z][A-Za-z0-9&'’\-]*(?:\s+[A-Z][A-Za-z0-9&'’\-]*){1,4}$/;

  const isTitleCaseHeadingLine = (line: string) => {
    const trimmed = line.trim();
    if (trimmed.length > 45) return false;
    if (/[.!?]$/.test(trimmed)) return false;
    const words = trimmed.split(/\s+/);
    return words.length >= 2 && words.length <= 5 && titleCaseHeadingRegex.test(trimmed);
  };

  const isHeadingLine = (line: string) => {
    const trimmed = line.trim();
    return (
      /^(#{1,6})\s+/.test(trimmed) ||
      headingKeywords.has(trimmed.replace(/:$/, '')) ||
      headingPrefixRegex.test(trimmed) ||
      genericHeadingPrefixRegex.test(trimmed) ||
      /^[A-Z\s]{3,}$/.test(trimmed) ||
      isTitleCaseHeadingLine(trimmed)
    );
  };

  const parseHeadingPrefix = (line: string) => {
    const trimmed = line.trim();
    const match = trimmed.match(headingPrefixRegex) || trimmed.match(genericHeadingPrefixRegex);
    if (match) {
      return {
        heading: match[1].replace(/:$/, '').trim(),
        rest: match[2].trim(),
      };
    }
    return null;
  };

  const cleanHeading = (line: string) => line.replace(/^(#{1,6})\s+/, '').replace(/:$/, '').trim();

  const mergeSpecificTitleSubtitleLines = (lines: string[]) => {
    if (lines.length >= 2) {
      const normalizedTitle = lines[0].replace(/^#{1,6}\s*/, '').replace(/:$/, '').trim();
      const normalizedSubtitle = lines[1].trim();
      if (
        /^The Unseen Gaze$/i.test(normalizedTitle) &&
        /^Elements Interactive,\s*Pexels,\s*and Pakistan['’]s Digital Visual Narrative$/i.test(normalizedSubtitle)
      ) {
        return lines.slice(2);
      }
    }
    return lines;
  };

  return rawBlocks.flatMap((block) => {
    let lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    lines = mergeSpecificTitleSubtitleLines(lines);

    if (lines.length === 0) return [];

    const isList = lines.every((line) => /^([*\-•]|\d+\.)\s+/.test(line));
    if (isList) {
      return [{
        type: 'list' as const,
        items: lines.map((line) => line.replace(/^([*\-•]|\d+\.)\s+/, '').trim()),
      }];
    }

    const sections: Array<any> = [];
    let currentHeading: string | null = null;
    let currentSubheading: string | null = null;
    let currentLines: string[] = [];

    const flushCurrent = () => {
      if (currentHeading && currentLines.length > 0) {
        sections.push({
          type: 'section' as const,
          heading: currentHeading,
          subheading: currentSubheading,
          text: currentLines.join(' '),
        });
      } else if (currentHeading && currentSubheading) {
        sections.push({
          type: 'section' as const,
          heading: currentHeading,
          subheading: currentSubheading,
          text: '',
        });
      } else if (currentHeading) {
        sections.push({
          type: 'heading' as const,
          text: currentHeading,
        });
      } else if (currentLines.length > 0) {
        sections.push({
          type: 'paragraph' as const,
          text: currentLines.join(' '),
        });
      }

      currentHeading = null;
      currentSubheading = null;
      currentLines = [];
    };

    for (const line of lines) {
      const headingPrefix = parseHeadingPrefix(line);
      if (headingPrefix) {
        if (currentHeading && currentLines.length === 0 && !currentSubheading) {
          currentSubheading = headingPrefix.heading;
          if (headingPrefix.rest) {
            currentLines.push(headingPrefix.rest);
          }
          continue;
        }

        flushCurrent();
        currentHeading = headingPrefix.heading;
        if (headingPrefix.rest) {
          currentLines.push(headingPrefix.rest);
        }
        continue;
      }

      if (isHeadingLine(line)) {
        const cleaned = cleanHeading(line);
        if (currentHeading && currentLines.length === 0 && !currentSubheading) {
          currentSubheading = cleaned;
          continue;
        }

        flushCurrent();
        currentHeading = cleaned;
        continue;
      }

      currentLines.push(line);
    }

    flushCurrent();
    return sections;
  });
}

function ProjectIcon({ label }: { label: string }) {
  return (
    <div className="w-20 h-20 rounded-3xl border border-black/10 bg-slate-100 flex items-center justify-center">
      <span className="text-[24px] font-black text-black/80">
        {makeLogoText(label)}
      </span>
    </div>
  );
}

function generateDetailedExplanation(project: any) {
  const title = project.title || 'this research project';
  return [
    `This project, ${title}, represents a significant step forward in our ongoing efforts to explore the intersection of technology and human experience.`,
    `Our team has spent months prototyping and refining the core systems, focusing on how ${project.tags?.[0] || 'innovative design'} can solve real-world problems.`,
    `The research methodology involved deep collaboration between engineers, designers, and community stakeholders to ensure that the final outcome is both technically robust and socially relevant.`,
    `Key innovations in this work include a novel approach to system architecture and a highly intuitive user interface that adapts to individual needs.`,
    `Initial results from our pilot studies indicate a high level of engagement and positive feedback from early adopters, suggesting a strong potential for broader impact.`,
    `Looking ahead, we plan to scale the ${project.group || 'initiative'} and integrate more advanced AI capabilities to further enhance the system's performance and accessibility.`,
    `By sharing our findings and tools with the wider community, we hope to inspire new forms of creative inquiry and contribute to a more just and resilient future.`,
    `Every detail of the project has been carefully considered to align with the Lab's core values of curiosity, equity, and interdisciplinary collaboration.`
  ];
}

export function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If we navigated here from a card click, Home.tsx hands us the project
  // object directly via router state so we can render instantly (no fetch
  // wait). We still re-fetch in the background to keep data fresh, but the
  // user never sees a loading screen in that case.
  const preloadedProject = (location.state as any)?.project ?? null;

  const [project, setProject] = useState<any | null>(preloadedProject);
  const [loading, setLoading] = useState(!preloadedProject);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    // Only show the blocking loading state if we have nothing to render yet.
    if (!preloadedProject) {
      setLoading(true);
    }

    fetchProjectByIdOrSlug(id)
      .then((data) => {
        if (!data) {
          if (!preloadedProject) setNotFound(true);
        } else {
          setProject(data);
        }
      })
      .catch(() => {
        if (!preloadedProject) setNotFound(true);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-black/50 text-[16px]">Loading project...</div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="px-4 md:px-8 py-14 max-w-[900px] mx-auto">
        <p className="text-[18px] text-black/70 mb-6">Project not found.</p>
        <button onClick={() => navigate('/projects')} className="rounded-lg px-5 py-3 bg-black text-white hover:bg-slate-900 transition">Back to projects</button>
      </div>
    );
  }

  const teamMembers: Array<{ name: string; role: string; email?: string; joinedAt?: string; isNew?: boolean }> = (project.team || [])
    .map((member: any) => {
      const joinedAt = member?.joinedAt ? new Date(member.joinedAt).toISOString() : undefined;
      const isNew = member?.isNew ?? (joinedAt
        ? Date.now() - new Date(joinedAt).getTime() < 1000 * 60 * 60 * 24 * 14
        : false);

      if (member?.user?.name) {
        return {
          name: member.user.name,
          role: member.role || 'Researcher',
          email: member.user.email,
          joinedAt,
          isNew,
        };
      }
      if (member?.name) {
        return {
          name: member.name,
          role: member.role || 'Researcher',
          email: member.email,
          joinedAt,
          isNew,
        };
      }
      if (typeof member === 'string') {
        return { name: member, role: 'Researcher', joinedAt, isNew };
      }
      return null;
    })
    .filter(Boolean);

  const tags: string[] = project.tags || [];
  const detailedExplanation = generateDetailedExplanation(project);

  // Prefer an explicit references/bibliography field if the project has one.
  // Otherwise, fall back to detecting a citation list embedded in the
  // description itself and split it out into bullet points.
  const explicitReferences = normalizeProjectReferences(project);
  const { body: descriptionBody, references: inlineReferences } =
    explicitReferences.length > 0
      ? { body: project.description || '', references: [] as string[] }
      : splitDescriptionReferences(project.description || '');
  const unseenGaze = extractUnseenGazeTitle(descriptionBody);
  const sanitizedDescriptionBody = unseenGaze.title ? unseenGaze.cleanedDescription : descriptionBody;
  const referenceItems = explicitReferences.length > 0 ? explicitReferences : inlineReferences;
  const rawDescriptionSections = parseProjectDescription(sanitizedDescriptionBody);
  const descriptionSections = rawDescriptionSections;
  const displayTitle = unseenGaze.title || project.title;
  const detailSubtitle = '';

  const videoSrc = project.videoUrl || '/16521670-hd_1920_1080_25fps.mp4';

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero banner ──
          Fixed, breakpoint-based heights instead of `28vw` — vw-based heights
          shrink unpredictably on narrow mobile viewports (and iOS Safari
          resizes vh/vw as the address bar shows/hides), which is what was
          letting the image spill outside the section and sit under the
          global header. overflow-hidden guarantees the image can never
          bleed past the section bounds. */}
      <section
        data-hero-section
        className="relative bg-black text-white flex items-center justify-center text-center overflow-hidden aspect-auto md:aspect-[16/5] min-h-[40vh] md:min-h-0"
      >
        <div className="absolute inset-0">
          <img
            src={project.coverImage || project.cover_image || '/image.gif'}
            alt=""
            className="w-full h-full object-cover scale-105 blur-[2px]"
          />
          {/* Gradient scrim, darkest through the middle where the title sits.
              This guarantees the title is legible even when the cover image
              itself contains baked-in text/UI (e.g. app screenshots). */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/70" />
        </div>

        <div className="absolute top-4 right-5 z-10">
          <span className="text-white/80 text-[13px] tracking-wide">
            {project.groupName || project.group || 'Research Project'}
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-[22px] sm:text-[28px] md:text-[44px] font-bold leading-snug px-6 max-w-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
        >
          {displayTitle}
        </motion.h1>
      </section>

      {/* ── Body: sidebar + main ── */}
      <div className="flex min-h-[calc(100vh-280px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="hidden md:flex flex-col flex-shrink-0 border-r border-black/10 relative z-10 -mt-24 bg-white shadow-[0_-16px_24px_-12px_rgba(0,0,0,0.18)]"
          style={{ width: '320px', minWidth: '280px', padding: '1.5rem 1.5rem 2rem' }}
        >
          <div className="border-t border-black/10 pt-5 mb-5">
            {teamMembers.length > 0 && (
              <div className="mb-1">
                <p className="text-[13px] text-black/80">
                  by {teamMembers.map(m => m.name).join(', ')}
                </p>
              </div>
            )}
            <p className="text-[13px] text-black/50">
              {formatDate(project.createdAt || project.publishedAt)}
            </p>
          </div>

          <div className="border-t border-black/10 pt-5 mb-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-2">
              Groups
            </p>
            <div className="space-y-1">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <p key={tag} className="text-[13px] text-black/60 hover:text-black cursor-pointer transition-colors">
                    {tag}
                  </p>
                ))
              ) : (
                <>
                  <p className="text-[13px] text-black/60">{project.group || "Director's Office"}</p>
                  <p className="text-[13px] text-black/60">External Relations</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-black/10 pt-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-3">
              Share this post
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on X">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-black/50 hover:text-black transition-colors" aria-label="Share on Bluesky">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ── Team members ── */}
          {teamMembers.length > 0 && (
            <div className="border-t border-black/10 pt-5 mt-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-black/40 mb-4">
                Team
              </p>
              <div className="space-y-4">
                {teamMembers.map((member, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-bold text-black leading-tight">
                        {member.name}
                      </p>
                      {member.isNew && (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-[10px] uppercase tracking-[0.16em] px-2 py-1">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-black/50">
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-black/10 pt-6 mt-6">
            <button
              type="button"
              onClick={() => navigate('/research')}
              className="w-16 h-16 flex items-center justify-center"
              title="Back to Research"
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="8" width="48" height="48" stroke="currentColor" strokeWidth="5" className="text-black" />
                <rect x="22" y="22" width="20" height="20" stroke="currentColor" strokeWidth="5" className="text-black" />
              </svg>
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 px-6 md:px-12 py-10 max-w-[860px]">

          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="flex md:hidden items-center gap-1 text-[13px] text-black/60 hover:text-black mb-6 transition-colors"
          >
            ← Back to projects
          </button>

          <div className="mb-10">
            
            <p className="text-[17px] md:text-[19px] font-bold leading-snug mb-2 text-left">
              {displayTitle}
            </p>

            {detailSubtitle ? (
              <p className="text-[15px] md:text-[16px] italic text-black/70 mb-5">
                {detailSubtitle}
              </p>
            ) : null}

            {descriptionSections.length > 0 && (
              <div className="space-y-8 text-[15px] md:text-[16px] text-black/80 leading-relaxed text-justify">
                {project.slug === 'visual-culture-digital-narrative' ? (
                  <h2 className="text-[15px] md:text-[17px] font-semibold leading-snug text-left break-words">
                    The Unseen Gaze; Elements Interactive, Pexels, and Pakistan's Digital Visual
                  </h2>
                ) : null}

                {(project.slug === 'visual-culture-digital-narrative'
                  ? descriptionSections.slice(2)
                  : descriptionSections
                ).map((section, idx) => {
                  if (section.type === 'heading') {
                    return (
                      <h2 key={idx} className="text-[19px] md:text-[21px] font-semibold mb-3 leading-tight">
                        {project.slug === 'visual-culture-digital-narrative' &&
                  section.text.trim().toLowerCase() === 'narrative'
                    ? 'Narrative'
                    : section.text}
                      </h2>
                    );
                  }

                  if (section.type === 'section') {
                    return (
                      <div key={idx} className="space-y-3">
                        <div>
                          <h2 className="text-[19px] md:text-[21px] font-semibold leading-tight">
                            {project.slug === 'visual-culture-digital-narrative' &&
                            section.heading.trim().toLowerCase() === 'narrative'
                              ? 'Narrative'
                              : section.heading}
                          </h2>
                          {section.subheading && (
                            <p className="text-[15px] md:text-[16px] font-semibold text-black/70 mt-2">
                              {section.subheading}
                            </p>
                          )}
                        </div>
                        {section.text ? (
                          <p className="text-justify whitespace-pre-line">
                            {project.slug === 'visual-culture-digital-narrative'
                              ? section.text.replace(
                                  /^\s*[.??]\s*(?=Elements Interactive)/i,
                                  ''
                                )
                              : section.text}
                          </p>
                        ) : null}
                      </div>
                    );
                  }

                  if (section.type === 'list') {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-2">
                        {section.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="text-justify leading-relaxed">
                            {linkifyText(item)}
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={idx} className="text-justify whitespace-pre-line">
                      {project.slug === 'visual-culture-digital-narrative'
                              ? section.text.replace(
                                  /^\s*[.??]\s*(?=Elements Interactive)/i,
                                  ''
                                )
                              : section.text}
                    </p>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mb-10 rounded-2xl overflow-hidden border border-black/10 bg-black aspect-video">
            <video controls className="w-full h-full object-cover">
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="space-y-6 text-[15px] md:text-[16px] text-black/80 leading-relaxed text-justify mb-10">
            {detailedExplanation.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>

          {referenceItems.length > 0 && (
            <section className="mb-10">
              <h2 className="text-[20px] font-semibold mb-4">References</h2>
              <ul className="list-disc list-inside space-y-2 text-black/80">
                {referenceItems.map((item, idx) => (
                  <li key={idx} className="text-[15px] leading-relaxed">
                    {linkifyText(item)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-12 pt-6 border-t border-black/10">
            {project.status && (
              <span className="px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[12px] text-black/60 uppercase tracking-wider">
                {project.status}
              </span>
            )}
            {tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-black/5 border border-black/10 rounded-full text-[12px] text-black/60">
                {tag}
              </span>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
