import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Settings, 
  FileText, 
  Lock,
  Bell,
  Zap
} from 'lucide-react';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Reports', href: '/reports', icon: FileText },
  { name: 'Security', href: '/settings', icon: Shield },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Zap className="text-zinc-950" size={20} />
        </div>
        <span className="font-bold text-xl tracking-tight text-zinc-100">VEIL</span>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => clsx(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
            )}
          >
            <item.icon size={18} />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Network Secure</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Your identity is protected by end-to-end zero-knowledge proofs.
          </p>
        </div>
        
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 mt-4 rounded-xl text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
        >
          <Settings size={18} />
          Settings
        </NavLink>
      </div>
    </aside>
  );
};
