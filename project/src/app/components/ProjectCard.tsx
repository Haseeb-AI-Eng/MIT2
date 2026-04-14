import { motion } from 'motion/react';

interface ProjectCardProps {
  image: string;
  title: string;
  group: string;
  researchers: string;
}

export function ProjectCard({ image, title, group, researchers }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <h3 className="text-[18px] font-[500] mb-2 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">
        {title}
      </h3>
      <p className="text-[14px] text-black/60 mb-1 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">{group}</p>
      <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">{researchers}</p>
    </motion.div>
  );
}
