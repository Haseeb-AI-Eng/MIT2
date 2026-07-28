import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatCard } from '../../components/admin/StatCard';
import { fetchDashboardSummary } from '../../adminApi';
import {
  FolderKanban, Newspaper, FlaskConical, Users, Mail, Tag as TagIcon,
  ArrowUpRight, Plus, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6', reviewing: '#f59e0b', contacted: '#8b5cf6', accepted: '#10b981', rejected: '#ef4444',
};

export function AdminDashboardHome() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardSummary()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const trend = (data?.submissionTrend || []).map((d: any) => ({ date: d._id.slice(5), count: d.count }));
  const statusPie = (data?.submissionsByStatus || []).map((d: any) => ({ name: d._id || 'unknown', value: d.count }));

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of your site's content and activity"
      actions={
        <button
          onClick={() => navigate('/admin/projects')}
          className="hidden sm:inline-flex items-center gap-2 bg-[var(--accent-brand,#910B08)] hover:opacity-90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Projects" value={data?.totals?.projects ?? 0} icon={FolderKanban} accent="brand" hint={`${data?.totals?.publishedProjects ?? 0} published · ${data?.totals?.draftProjects ?? 0} draft`} />
            <StatCard label="Articles" value={data?.totals?.articles ?? 0} icon={Newspaper} accent="blue" />
            <StatCard label="Labs" value={data?.totals?.labs ?? 0} icon={FlaskConical} accent="green" />
            <StatCard label="Tags" value={data?.totals?.tags ?? 0} icon={TagIcon} accent="amber" />
            <StatCard label="Team & Users" value={data?.totals?.users ?? 0} icon={Users} accent="slate" />
            <StatCard label="Applications" value={data?.totals?.submissions ?? 0} icon={Mail} accent="blue" hint={`${data?.totals?.newSubmissions ?? 0} unread`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Applications — last 14 days</h3>
              </div>
              {trend.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-slate-400">No submissions in this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent-brand,#910B08)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--accent-brand,#910B08)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="var(--accent-brand,#910B08)" fill="url(#colorCount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Applications by Status</h3>
              {statusPie.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-slate-400">No data yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {statusPie.map((entry: any, i: number) => (
                        <Cell key={i} fill={STATUS_COLORS[entry.name] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RecentList
              title="Recent Projects"
              items={(data?.recent?.projects || []).map((p: any) => ({ id: p._id, title: p.title, sub: p.status }))}
              onSeeAll={() => navigate('/admin/projects')}
              emptyLabel="No projects yet"
            />
            <RecentList
              title="Recent Articles"
              items={(data?.recent?.articles || []).map((a: any) => ({ id: a._id, title: a.title, sub: a.category }))}
              onSeeAll={() => navigate('/admin/articles')}
              emptyLabel="No articles yet"
            />
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent-brand,#910B08)]" /> Activity Feed</h3>
              </div>
              {(!data?.activity || data.activity.length === 0) ? (
                <p className="text-sm text-slate-400 py-8 text-center">No recent activity</p>
              ) : (
                <ul className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {data.activity.map((a: any, i: number) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-brand,#910B08)] mt-1.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-slate-700 leading-snug">{a.message}</p>
                        <p className="text-xs text-slate-400">{new Date(a.createdAt).toLocaleString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function RecentList({ title, items, onSeeAll, emptyLabel }: { title: string; items: { id: string; title: string; sub?: string }[]; onSeeAll: () => void; emptyLabel: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <button onClick={onSeeAll} className="text-xs font-semibold text-[var(--accent-brand,#910B08)] flex items-center gap-1 hover:underline">
          See all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">{emptyLabel}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-800 truncate">{item.title}</span>
              {item.sub && <span className="text-xs text-slate-400 capitalize shrink-0 ml-2">{item.sub}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
