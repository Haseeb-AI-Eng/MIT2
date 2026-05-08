import { motion } from 'motion/react';
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

export function NewsCard({ image, title, description, category, date, size = 'medium', aspect = 'normal', onClick }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer overflow-hidden border border-black/5 bg-white rounded-none"
      onClick={onClick}
    >
      <div className={`relative overflow-hidden bg-gray-100 mb-4 ${
        aspect === 'tall' ? 'aspect-[1/1]' : 'aspect-[16/9]'
      }`}>
        <ImageWithFallback
          src={image || ''}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute left-[45%] bottom-0 -translate-x-1/2 translate-y-1/2 h-0 w-0 border-l-[18px] border-r-[18px] border-b-[18px] border-l-transparent border-r-transparent border-b-white" />
      </div>
      <div className="px-5 pb-5">
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
        {description && (
          <p
            className={`transition-colors duration-200 ${
              size === 'large'
                ? 'text-[16px] leading-[1.5] mb-2'
                : size === 'medium'
                ? 'text-[15px] leading-[1.5] mb-2'
                : 'text-[14px] leading-[1.5] mb-2'
            } font-sans text-black/85 group-hover:text-[#199BD8] hover:text-[#199BD8]`}
            style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif" }}
          >
            {description}
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
