import { motion } from 'motion/react';

interface HeroCardProps {
  image: string;
  title: string;
  overlay?: boolean;
}

export function HeroCard({ image, title, overlay = false }: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative aspect-[16/10] overflow-hidden bg-black group cursor-pointer"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <h2 className="text-white text-[48px] md:text-[64px] font-[300] text-center px-8 leading-tight">
            {title}
          </h2>
        </div>
      )}
    </motion.div>
  );
}
