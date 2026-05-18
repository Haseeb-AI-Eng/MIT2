import { motion } from 'motion/react';
import { memo } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsCardProps {
  image?: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
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

// Fixed image height shared by wide + side cards so they always match exactly
const ROW_IMAGE_HEIGHT = '340px';

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

  // wide and side use a fixed pixel height so both cards in the same row
  // are always exactly the same height regardless of column width.
  // normal/tall continue to use aspect-ratio as before.
  const isFixedHeight = aspect === 'wide' || aspect === 'side';
  const imageAspectClass =
    aspect === 'tall' ? 'aspect-[3/4]' : aspect === 'normal' ? 'aspect-square' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group cursor-pointer overflow-hidden bg-white rounded-none flex flex-col h-full"
      onClick={onClick}
    >
      {/* Image container */}
      <div
        className={`relative overflow-hidden bg-gray-100 flex-shrink-0 w-full ${imageAspectClass}`}
        style={isFixedHeight ? { height: ROW_IMAGE_HEIGHT } : undefined}
      >
        <ImageWithFallback
          src={image || ''}
          alt={title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#199BD8] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
        <div className="absolute left-[45%] bottom-0 -translate-x-1/2 translate-y-1/2 h-0 w-0 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent group-hover:border-b-[#199BD8] border-b-white transition-colors duration-500 pointer-events-none z-20" />
      </div>

      {/* Text below image */}
      <div className="px-5 py-4 flex flex-col">
        {category && (
          <div className="uppercase tracking-wider mb-2 text-[12px] text-[#8a8a8a]">
            {category}
          </div>
        )}
        <h3
          className={`font-sans text-black group-hover:text-[#199BD8] group-hover:opacity-80 transition-all duration-200 ${
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