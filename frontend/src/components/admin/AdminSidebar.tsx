import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  BarChart3,
  Users,
  ShieldAlert,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/useAuthStore';

const folders = [
  { name: 'Inbox', href: '/admin/reports/inbox', icon: Inbox },
  { name: 'Verified', href: '/admin/reports/verified', icon: CheckCircle2 },
  { name: 'Flagged', href: '/admin/reports/flagged', icon: AlertOctagon },
  { name: 'Spam', href: '/admin/reports/spam', icon: Trash2 },
];

const analytics = [
  { name: 'Insights', href: '/admin/insights', icon: BarChart3 },
  { name: 'Reputation', href: '/admin/reputation', icon: Users },
];

export const AdminSidebar = () => {
  const { logout } = useAuthStore();

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col h-full relative z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <ShieldAlert className="text-zinc-950" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-none tracking-tight text-zinc-100">VEIL</span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1">Validator Portal</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-8 mt-4">
        <div>
          <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Reports
          </p>
          <div className="space-y-1">
            <NavLink
              to="/admin-dashboard"
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)] border border-emerald-500/10"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
              )}
            >
              <LayoutDashboard size={18} />
              Overview
            </NavLink>
            {folders.map((folder) => (
              <NavLink
                key={folder.name}
                to={folder.href}
                className={({ isActive }) => clsx(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)] border border-emerald-500/10"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <folder.icon size={18} />
                  {folder.name}
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <p className="px-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Organization
          </p>
          <div className="space-y-1">
            {analytics.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)] border border-emerald-500/10"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/10"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
