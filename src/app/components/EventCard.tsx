import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventCardProps {
  image: string;
  title: string;
  date: string;
  tag?: string;
  onClick?: () => void;
}

export function EventCard({ image, title, date, tag, onClick }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-3 relative">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {tag && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 text-[11px] uppercase tracking-wider font-[500]">
            {tag}
          </div>
        )}
      </div>
      <h4 className="text-[16px] font-[500] mb-2 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">
        {title}
      </h4>
      <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">{date}</p>
    </motion.div>
  );
}
