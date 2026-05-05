import { motion } from 'motion/react';

interface NewsItemProps {
  date: string;
  title: string;
  category: string;
}

export function NewsItem({ date, title, category }: NewsItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-b border-black/10 py-6 hover:bg-black/[0.02] transition-colors cursor-pointer group"
    >
      <div className="flex gap-8 items-start">
        <div className="text-[13px] text-black/40 min-w-[100px]">{date}</div>
        <div className="flex-1">
          <span className="text-[11px] uppercase tracking-wider text-black/40 mb-2 block">
            {category}
          </span>
          <h4 className="text-[16px] font-[500] group-hover:opacity-60 transition-opacity">
            {title}
          </h4>
        </div>
      </div>
    </motion.div>
  );
}
