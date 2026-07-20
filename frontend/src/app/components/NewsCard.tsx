import { motion } from 'motion/react';
import { memo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

function ProjectCardLogo() {
  return (
    <div className="w-10 h-10 flex items-center justify-center pointer-events-none">
      <svg width="40" height="40" viewBox="0 0 72 72" fill="none" shapeRendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="64" height="64" stroke="white" strokeWidth="8" fill="none" strokeLinejoin="miter" strokeLinecap="square" />
        <rect x="18" y="18" width="36" height="36" fill="white" />
        <rect x="26" y="26" width="20" height="20" fill="transparent" />
        <rect x="46" y="46" width="10" height="10" fill="white" />
      </svg>
    </div>
  );
}

interface NewsCardProps {
  image?: string;
  videoUrl?: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  viewCount?: number;
  size?: 'small' | 'medium' | 'large';
  aspect?: 'normal' | 'tall' | 'wide' | 'side';
  onClick?: () => void;
}

function trimText(text: string, maxChars: number = 200): string {
  if (text.length > maxChars) {
    return text.substring(0, maxChars).trim() + '...';
  }
  return text;
}

const HEADING_KEYWORDS = new Set([
  'Narrative',
  'Abstract',
  'Introduction',
  'Community Service',
  'Conceptual Framework',
  'Visual Representation and Social Semiotics',
  'Nation Branding, Soft Power, and Platform Circulation',
  'Elements Interactive on Pexels as a Case Study',
  'Research Opportunities for Media Students',
  'Semiotic and Content Analysis',
  'Research Opportunities for Technology Students',
  'Metadata, APIs, and Data Collection',
  'Discussion',
  'Background',
  'Methodology',
  'Results',
  'Conclusion',
  'Summary',
]);

function getAdjustedNewsCardText(title: string, description?: string) {
  const mergedTitle = 'The Unseen Gaze; Elements Interactive, Pexels, and Pakistan’s Digital Visual';
  const titleRegex = /^The Unseen Gaze:?$/i;
  const subtitleRegex = /^Elements Interactive,\s*Pexels,\s*and Pakistan['’]s Digital Visual(?:\s+Narrative)?$/i;
  const normalizeLine = (line: string) => line.replace(/^\s*#{1,6}\s*/, '').trim();
  if (!description) return { title, description };

  const normalized = description.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n').map((line) => normalizeLine(line.trim())).filter(Boolean);
  if (lines.length >= 2 && titleRegex.test(lines[0]) && subtitleRegex.test(lines[1])) {
    return {
      title: mergedTitle,
      description: lines.slice(2).join(' '),
    };
  }

  if (title === 'The Unseen Gaze' && lines.length > 0 && subtitleRegex.test(lines[0])) {
    return {
      title: mergedTitle,
      description: lines.slice(1).join(' '),
    };
  }

  return { title, description };
}

function isTitleCaseHeadingLine(line: string) {
  const trimmed = line.trim();
  if (trimmed.length > 45) return false;
  if (/[.!?]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/);
  return words.length >= 2 && words.length <= 5 && /^[A-Z][A-Za-z0-9&'’\-]*(?:\s+[A-Z][A-Za-z0-9&'’\-]*){1,4}$/.test(trimmed);
}

function parseNewsCardPreview(description?: string) {
  if (!description) return { heading: '', text: '' };

  const normalized = description.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return { heading: '', text: '' };

  const headingRegex = new RegExp(
    `^(${[...HEADING_KEYWORDS].map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?::)?(?:\\s+(.+))?$`,
    'i'
  );

  let heading = '';
  let headingLineRest = '';
  let headingLineIndex = -1;

  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(headingRegex);
    if (match) {
      heading = match[1].trim();
      headingLineRest = match[2]?.trim() || '';
      headingLineIndex = i;
      break;
    }
    if (HEADING_KEYWORDS.has(lines[i]) || isTitleCaseHeadingLine(lines[i])) {
      heading = lines[i];
      headingLineRest = '';
      headingLineIndex = i;
      break;
    }
  }

  if (headingLineIndex === -1) {
    return { heading: '', text: lines.join(' ') };
  }

  const remainingLines = [headingLineRest, ...lines.slice(headingLineIndex + 1)].filter(Boolean);
  return { heading, text: remainingLines.join(' ') };
}

// ── Fixed image heights per breakpoint, per role ──────────────────────────
// Using a fixed pixel height (rather than aspect-square, which scales with
// the container's *width*) is what actually guarantees every card in a row
// has the same image height — aspect-square only matches heights when every
// card also happens to be the same width, which isn't true once "huge"/"wide"
// cards span extra columns next to "normal" ones.
//
// Values are tuned per breakpoint so normal cards on mobile (2-col grid)
// don't get an image taller than is reasonable for that column width.
const NORMAL_IMAGE_HEIGHT = 'h-[180px] sm:h-[220px] md:h-[260px] lg:h-[300px]';
const FEATURED_IMAGE_HEIGHT = 'h-[180px] sm:h-[300px] md:h-[380px] lg:h-[500px]';

// Fixed text-container height so title+description blocks line up across a
// row even when descriptions differ in length. line-clamp handles overflow.
const NORMAL_TEXT_HEIGHT = 'min-h-[150px] sm:min-h-[160px]';
const FEATURED_TEXT_HEIGHT = 'min-h-[170px] sm:min-h-[190px]';

function isVideoMedia(url?: string): boolean {
  if (!url) return false;

  const cleanUrl = url.toLowerCase().split('?')[0].replace(/\/+$/, '');

  if (/\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl)) return true;
  if (cleanUrl.includes('/video/upload/')) return true;
  if (cleanUrl.startsWith('data:video/')) return true;
  if (cleanUrl.includes('/pexels.com/video/') || cleanUrl.includes('/videos.pexels.com/')) return true;
  if (/\/video\//.test(cleanUrl) && !/\.(jpe?g|png|gif|svg|webp)$/i.test(cleanUrl)) return true;

  return false;
}

function NewsCardComponent(props: NewsCardProps) {
  const {
    image,
    videoUrl,
    title,
    description,
    category,
    date,
    size = 'medium',
    aspect = 'normal',
    onClick,
  } = props;
  const adjusted = getAdjustedNewsCardText(title, description);
  const preview = parseNewsCardPreview(adjusted.description);
  const trimmedDescription = preview.text ? trimText(preview.text) : undefined;
  const displayTitle = adjusted.title;
  const previewHeading = preview.heading;

  // Sometimes uploaded videos are stored inside the image/coverImage field.
  const resolvedVideoUrl = videoUrl || (isVideoMedia(image) ? image : '');
  const resolvedImage = resolvedVideoUrl === image ? '' : image || '';

  const isFeatured = aspect === 'wide' || aspect === 'side';
  const imageHeightClass = isFeatured ? FEATURED_IMAGE_HEIGHT : NORMAL_IMAGE_HEIGHT;
  const textHeightClass = isFeatured ? FEATURED_TEXT_HEIGHT : NORMAL_TEXT_HEIGHT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group cursor-pointer overflow-hidden bg-white rounded-none flex flex-col h-full w-full min-w-0"
      onClick={onClick}
    >
      {/* Image / video container — fixed height so every card in a row matches,
          regardless of column width. */}
      <div
        className={`relative overflow-hidden bg-gray-100 flex-shrink-0 w-full ${imageHeightClass}`}
      >
        {resolvedVideoUrl ? (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            src={resolvedVideoUrl}
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={resolvedImage || undefined}
          />
        ) : (
          <ImageWithFallback
            src={resolvedImage}
            alt={title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
          />
        )}
        {resolvedVideoUrl && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />
        )}
        <div className="absolute left-3 bottom-3 z-20">
          <ProjectCardLogo />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#199BD8] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
        <div className="absolute left-[45%] bottom-0 -translate-x-1/2 translate-y-1/2 h-0 w-0 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent group-hover:border-b-[#199BD8] border-b-white transition-colors duration-500 pointer-events-none z-20" />
      </div>

      {/* Text below image — fixed min-height so the container (and the row
          it's part of) stays the same size regardless of description length.
          line-clamp-3 truncates any overflow so text never breaks the box. */}
      <div className={`px-5 py-4 flex flex-col w-full min-w-0 ${textHeightClass}`}>
        {category && (
          <div className="uppercase tracking-wider mb-2 text-[12px] text-[#8a8a8a]">
            {category}
          </div>
        )}
        <h3
          className={`font-sans text-black group-hover:text-[#199BD8] group-hover:opacity-80 transition-all duration-200 line-clamp-2 ${
            size === 'large'
              ? 'text-[24px] leading-[1.2] font-semibold mb-2'
              : size === 'medium'
              ? 'text-[20px] leading-[1.25] font-semibold mb-2'
              : 'text-[17px] leading-[1.3] font-semibold mb-2'
          }`}
          style={{ fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {displayTitle}
        </h3>
        {previewHeading && (
          <p className="text-[13px] uppercase tracking-[0.2em] text-slate-900 font-bold mb-1">
            {previewHeading}
          </p>
        )}
        {trimmedDescription && (
          <p
            className={`font-sans text-black/75 group-hover:text-[#199BD8] transition-colors duration-200 line-clamp-3 ${
              size === 'large' ? 'text-[15px] leading-[1.5]' : 'text-[13px] leading-[1.5]'
            }`}
            style={{ fontFamily: "'Poppins', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {trimmedDescription}
          </p>
        )}
        {date && (
          <div className="text-[12px] text-[#8a8a8a] mt-2">{date}</div>
        )}
      </div>
    </motion.div>
  );
}

export const NewsCard = memo(NewsCardComponent);