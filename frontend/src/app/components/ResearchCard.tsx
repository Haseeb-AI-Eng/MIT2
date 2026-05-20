import { motion } from 'motion/react';
import { Trash2, Eye } from 'lucide-react';

interface ResearchCardProps {
  logoText: string;
  title: string;
  subtitle: string;
  tags: string[];
  teamCount: number;
  status: string;
  authorName?: string;
  viewCount?: number;
  onClick?: () => void;
  onDelete?: () => void;
}

// Generates a geometric MIT Media Lab–style SVG logo from 1–2 letters
function GeometricLogo({ text }: { text: string }) {
  const letter = text.slice(0, 1).toUpperCase();

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer square */}
      <rect x="2" y="2" width="68" height="68" stroke="black" strokeWidth="5" fill="none" />
      {/* Inner cutout — top-right corner removed to create the MIT Media Lab bracket look */}
      <rect x="18" y="18" width="36" height="36" fill="black" />
      {/* White cutout inside to create letter-like negative space */}
      <rect x="26" y="26" width="20" height="20" fill="white" />
      {/* Small accent square bottom-right */}
      <rect x="46" y="46" width="10" height="10" fill="white" />
      {/* Letter overlay — subtle, centered */}
      <text
        x="36"
        y="41"
        textAnchor="middle"
        fontSize="16"
        fontWeight="700"
        fontFamily="Georgia, serif"
        fill="white"
        style={{ userSelect: 'none' }}
      >
        {letter}
      </text>
    </svg>
  );
}

export function ResearchCard({
  logoText,
  title,
  subtitle,
  tags,
  teamCount,
  status,
  authorName,
  viewCount = 0,
  onClick,
  onDelete,
}: ResearchCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && confirm('Are you sure you want to delete this research project?')) {
      onDelete();
    }
  };

  // Show up to 3 tags inline, then "+N more"
  const visibleTags = tags.slice(0, 3);
  const extraCount = tags.length - visibleTags.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative w-full bg-white border-b border-r border-black/12 cursor-pointer"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.12)', borderRight: '1px solid rgba(0,0,0,0.12)' }}
      onClick={onClick}
    >
      <div className="p-7 flex flex-col gap-4 min-h-[280px]">

        {/* Top row: logo + group name */}
        <div className="flex items-center gap-4">
          <GeometricLogo text={logoText} />
          <span
            className="text-[15px] font-bold text-black leading-tight"
            style={{ fontFamily: 'Georgia, serif', maxWidth: 140 }}
          >
            {title.toLowerCase().replace(/\b\w/g, c => c)}
          </span>
        </div>

        {/* Subtitle */}
        <p
          className="text-[15px] font-normal text-black/60 leading-relaxed"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {subtitle}
        </p>

        {/* Author */}
        {authorName && (
          <p className="text-[13px] text-black/50" style={{ fontFamily: 'Georgia, serif' }}>
            {authorName}
          </p>
        )}

        {/* Tags */}
        <p className="text-[13px] text-black/45" style={{ fontFamily: 'Georgia, serif' }}>
          {visibleTags.map(t => `#${t.replace(/^#/, '')}`).join(' ')}
          {extraCount > 0 && (
            <span className="ml-1">+{extraCount} more</span>
          )}
        </p>

        {/* View count with eye icon */}
        {viewCount > 0 && (
          <div className="flex items-center gap-1.5 text-[13px] text-black/50">
            <Eye size={14} />
            <span>{viewCount} {viewCount === 1 ? 'view' : 'views'}</span>
          </div>
        )}

        {/* Delete button — top right, subtle */}
        {onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-4 right-4 p-1.5 text-black/20 hover:text-red-500 transition"
            title="Delete project"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </motion.div>
  );
}