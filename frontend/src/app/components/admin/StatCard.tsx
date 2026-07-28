import { LucideIcon } from 'lucide-react';
import { cn } from '../ui/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'brand' | 'blue' | 'green' | 'amber' | 'slate';
  hint?: string;
}

const ACCENTS: Record<string, string> = {
  brand: 'bg-[var(--accent-brand,#910B08)]/10 text-[var(--accent-brand,#910B08)]',
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  slate: 'bg-slate-100 text-slate-700',
};

export function StatCard({ label, value, icon: Icon, accent = 'slate', hint }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', ACCENTS[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
