import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, Newspaper, FlaskConical, Tags, Megaphone,
  Users, Settings, LogOut, Menu, X, ChevronLeft, Search, Bell, ExternalLink,
} from 'lucide-react';
import { LogoIcon } from '../Logo';
import { cn } from '../ui/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/applications', label: 'Applications', icon: Megaphone },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/articles', label: 'Articles & News', icon: Newspaper },
  { to: '/admin/labs', label: 'Labs', icon: FlaskConical },
  { to: '/admin/tags', label: 'Tags', icon: Tags },
  { to: '/admin/announcements', label: 'Announcements', icon: Bell },
  { to: '/admin/users', label: 'Users & Roles', icon: Users },
  { to: '/admin/settings', label: 'Site & Theme Settings', icon: Settings },
];

export function AdminLayout({ children, title, subtitle, actions }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('admin_sidebar_collapsed') === '1');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin/login');
  };

  const initials = (user?.name || 'A')
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen flex bg-[#f7f7fa]" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 h-screen z-50 bg-[#0a0a12] text-white flex flex-col transition-all duration-200 shrink-0',
          collapsed ? 'w-[76px]' : 'w-[264px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
          <LogoIcon height={28} outlineColor="#ffffff" />
          {!collapsed && (
            <div className="flex flex-col leading-tight overflow-hidden">
              <span className="font-bold text-sm tracking-wide truncate">ELEMENTS</span>
              <span className="text-[10px] text-white/50 tracking-widest">ADMIN PANEL</span>
            </div>
          )}
          <button
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group relative',
                  isActive
                    ? 'bg-[var(--accent-brand,#910B08)] text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ExternalLink className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>View Live Site</span>}
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-red-600/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ChevronLeft className={cn('w-[18px] h-[18px] shrink-0 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-4 px-4 lg:px-8">
          <button className="lg:hidden text-slate-700" onClick={() => setMobileOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-slate-500 truncate">{subtitle}</p>}
          </div>
          <div className="ml-auto flex items-center gap-3">
            {actions}
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[var(--accent-brand,#910B08)] text-white flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div className="leading-tight hidden md:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500 capitalize">{user?.role || 'admin'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
