import { motion } from 'motion/react';

interface NewsCardProps {
  image?: string;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

export function NewsCard({ image, title, description, category, date, size = 'medium', onClick }: NewsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      {image && (
        <div className={`overflow-hidden bg-gray-100 mb-4 ${
          size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/3]'
        }`}>
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      )}
      <div>
        {category && (
          <div className="text-[11px] uppercase tracking-wider text-black/40 mb-2">
            {category}
          </div>
        )}
        <h3 className={`group-hover:opacity-60 transition-opacity duration-200 ${
          size === 'large' ? 'text-[24px] font-[500] mb-3' :
          size === 'medium' ? 'text-[18px] font-[500] mb-2' :
          'text-[16px] font-[500] mb-2'
        } font-serif text-black hover:text-blue-600 group-hover:text-blue-600`}>
          {title}
        </h3>
        {description && (
          <p className="text-[14px] text-black/60 leading-relaxed mb-2 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">
            {description}
          </p>
        )}
        {date && (
          <div className="text-[13px] text-black/40">
            {date}
          </div>
        )}
      </div>
    </motion.div>
  );
}
