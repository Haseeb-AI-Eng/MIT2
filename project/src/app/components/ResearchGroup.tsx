import { motion } from 'motion/react';

interface ResearchGroupProps {
  name: string;
  lead: string;
  description: string;
}

export function ResearchGroup({ name, lead, description }: ResearchGroupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="border border-black/10 p-8 hover:border-black/30 transition-colors cursor-pointer group"
    >
      <h3 className="text-[20px] font-[500] mb-3 group-hover:opacity-60 transition-opacity">
        {name}
      </h3>
      <p className="text-[14px] text-black/60 mb-4">{lead}</p>
      <p className="text-[14px] text-black/70 leading-relaxed">{description}</p>
    </motion.div>
  );
}
