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

function NewsCardComponent({
  image,
  title,
  description,
  category,
  date,
  size = 'medium',
  aspect = 'normal',
  onClick,
}: NewsCardProps) {
  const trimmedDescription = description ? trimText(description) : undefined;

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
      {/* Image container — fixed height so every card in a row matches,
          regardless of column width. */}
      <div
        className={`relative overflow-hidden bg-gray-100 flex-shrink-0 w-full ${imageHeightClass}`}
      >
        <ImageWithFallback
          src={image || ''}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
        <div className="absolute left-3 bottom-3 z-20">
          <ProjectCardLogo label={category || title} />
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
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {title}
        </h3>
        {trimmedDescription && (
          <p
            className={`font-sans text-black/75 group-hover:text-[#199BD8] transition-colors duration-200 line-clamp-3 ${
              size === 'large' ? 'text-[15px] leading-[1.5]' : 'text-[13px] leading-[1.5]'
            }`}
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
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