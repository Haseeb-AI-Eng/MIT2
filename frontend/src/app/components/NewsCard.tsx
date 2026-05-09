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
  aspect?: 'normal' | 'tall';
  onClick?: () => void;
}

// Helper function to trim text to max 5 lines
function trimToLines(text: string, maxLines: number = 5): string {
  const lines = text.split('\n');
  if (lines.length > maxLines) {
    return lines.slice(0, maxLines).join('\n').trim() + '...';
  }
  // For text without explicit line breaks, approximate based on character count
  const avgCharsPerLine = 60;
  if (text.length > avgCharsPerLine * maxLines) {
    return text.substring(0, avgCharsPerLine * maxLines).trim() + '...';
  }
  return text;
}

function NewsCardComponent({ image, title, description, category, date, size = 'medium', aspect = 'normal', onClick }: NewsCardProps) {
  const trimmedDescription = description ? trimToLines(description, 5) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group cursor-pointer overflow-hidden bg-white rounded-none flex flex-col h-full"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden bg-gray-100 flex-shrink-0 ${
        aspect === 'tall' ? 'aspect-[3/3]' : 'aspect-[3/3]'
      }`}>
        <ImageWithFallback
          src={image || ''}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
        />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#199BD8] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />
        <div className="absolute left-[45%] bottom-0 -translate-x-1/2 translate-y-1/2 h-0 w-0 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent group-hover:border-b-[#199BD8] border-b-white transition-colors duration-500 pointer-events-none" />
      </div>
      <div className="px-5 py-4 flex flex-col flex-grow">
        {category && (
          <div className={`uppercase tracking-wider mb-2 ${
            size === 'large' ? 'text-[13px]' : 'text-[12px]'
          } text-[#8a8a8a]`}>
            {category}
          </div>
        )}
        <h3
          className={`group-hover:opacity-80 transition-opacity duration-200 ${
            size === 'large'
              ? 'text-[30px] leading-[1.2] font-semibold mb-2'
              : size === 'medium'
              ? 'text-[20px] leading-[1.25] font-semibold mb-2'
              : 'text-[18px] leading-[1.3] font-semibold mb-2'
          } font-sans text-black group-hover:text-[#199BD8]`}
          style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
        >
          {title}
        </h3>
        {trimmedDescription && (
          <p
            className={`transition-colors duration-200 line-clamp-5 flex-grow ${
              size === 'large'
                ? 'text-[16px] leading-[1.5] mb-2'
                : size === 'medium'
                ? 'text-[15px] leading-[1.5] mb-2'
                : 'text-[14px] leading-[1.5] mb-2'
            } font-sans text-black/85 group-hover:text-[#199BD8] hover:text-[#199BD8]`}
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {trimmedDescription}
          </p>
        )}
        {date && (
          <div className={`${size === 'large' ? 'text-[15px]' : 'text-[13px]'} text-[#8a8a8a]`}>
            {date}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const NewsCard = memo(NewsCardComponent);
