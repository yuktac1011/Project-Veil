import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import {
  Bell,
  Search,
  ChevronDown,
  LogOut,
  User,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { identity, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const copyAddress = () => {
    if (identity) {
      navigator.clipboard.writeText(identity.publicKey);
      addToast('Address copied to clipboard', 'success');
      setIsProfileOpen(false);
    }
  };

  const handleLogout = () => {
    // 1. Clear application state
    logout();

    // 2. Clear Anon Aadhaar storage to prevent auto-relogin loop
    // This is required because the SDK persists the proof in localStorage
    localStorage.removeItem("anonAadhaar");
    localStorage.removeItem("anon-aadhaar-pcd"); // Common key for some versions

    // 3. Force reload or redirect to ensure clean state
    window.location.href = "/auth";
  };

  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* ... search ... */}
      <div className="flex items-center flex-1">
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-1.5 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* ... bell ... */}
        <button className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border-2 border-zinc-950" />
        </button>

        <div className="h-8 w-px bg-zinc-800 mx-2" />

        <div className="relative">
          {/* ... profile button ... */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-900 transition-colors group"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 font-bold text-xs">
              {identity?.publicKey.slice(2, 4).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-zinc-200">Anonymous</p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {identity?.publicKey.slice(0, 6)}...
              </p>
            </div>
            <ChevronDown size={14} className={clsx("text-zinc-500 transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-0"
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50"
                >
                  <div className="px-3 py-2 mb-2">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Identity
                    </p>
                    <p className="text-sm font-mono text-zinc-300 mt-1 break-all">
                      {identity?.publicKey}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={copyAddress}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      <Copy size={16} />
                      Copy Address
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors">
                      <ExternalLink size={16} />
                      View on Explorer
                    </button>
                    <div className="h-px bg-zinc-800 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
