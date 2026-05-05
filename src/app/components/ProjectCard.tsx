import { motion } from 'motion/react';
import { Trash2 } from 'lucide-react';

interface ProjectCardProps {
  image: string;
  title: string;
  category: string;
  teamLabel: string;
  onClick?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({ image, title, category, teamLabel, onClick, onDelete }: ProjectCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (confirm('Are you sure you want to delete this project?')) {
        onDelete();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group w-full text-left relative"
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left cursor-pointer"
      >
        <div className="aspect-[16/9] overflow-hidden bg-gray-100 mb-4 relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {onDelete && (
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-3 right-3 p-2 bg-white/90 text-red-500 hover:bg-white hover:text-red-700 rounded-lg transition opacity-0 group-hover:opacity-100"
              title="Delete project"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <h3 className="text-[18px] font-[500] mb-2 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">
          {title}
        </h3>
        <p className="text-[14px] text-black/60 mb-1 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">{category}</p>
        <p className="text-[13px] text-black/40 font-serif transition-colors duration-200 hover:text-blue-600 group-hover:text-blue-600">{teamLabel}</p>
      </button>
    </motion.div>
  );
}