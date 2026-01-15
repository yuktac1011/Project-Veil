import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Trash2,
  Key,
  Fingerprint,
  Clock,
  Globe,
  AlertTriangle,
  Camera,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { useToastStore } from '../store/useToastStore';
import { Button } from '../components/ui/Button';
import { Toggle } from '../components/ui/Toggle';
import { clsx } from 'clsx';

type Tab = 'profile' | 'security' | 'notifications' | 'advanced';

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { identity, logout } = useAuthStore();
  const {
    alias, setAlias,
    autoLockTimer, setAutoLockTimer,
    notifications, toggleNotification
  } = useSettingsStore();
  const { addToast } = useToastStore();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'advanced', label: 'Advanced', icon: Globe },
  ];

  const handleWipeVault = () => {
    if (confirm('CRITICAL: This will permanently delete your identity vault and all local data. This cannot be undone. Are you sure?')) {
      logout();
      addToast('Vault wiped successfully', 'info');
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-10 pl-2">
        <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-zinc-500 mt-2 text-sm font-medium">Manage your anonymous identity and secure vault preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-72 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={clsx(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all border relative overflow-hidden group",
                activeTab === tab.id
                  ? "bg-black/40 border-white/10 text-emerald-500 shadow-lg backdrop-blur-xl"
                  : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabGlow"
                  className="absolute inset-0 bg-emerald-500/5"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              )}
              <tab.icon size={18} className="relative z-10" />
              <span className="relative z-10">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTabIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 relative z-10" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
              className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-2xl min-h-[500px]"
            >
              {activeTab === 'profile' && (
                <div className="space-y-10">
                  <div className="flex items-center gap-8">
                    <div className="relative group cursor-pointer">
                      <div className="h-32 w-32 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 text-5xl font-bold shadow-2xl shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                        {identity?.publicKey.slice(2, 4).toUpperCase()}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera className="text-white drop-shadow-lg" size={32} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-zinc-100">Identity Metadata</h3>
                      <p className="text-sm text-zinc-500 mt-1 font-medium">This information is stored locally on your device.</p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest shadow-inner">Active</span>
                        <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black uppercase tracking-widest">Local Vault</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Local Alias</label>
                      <input
                        type="text"
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-700 font-medium shadow-inner"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Public Key (Burner)</label>
                      <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-6 py-5 group hover:border-white/20 transition-colors shadow-inner">
                        <code className="text-sm text-emerald-500 font-mono flex-1 truncate selection:bg-emerald-500/30">
                          {identity?.publicKey}
                        </code>
                        <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors cursor-pointer hover:bg-emerald-500/10">
                          <Key size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-100">Vault Access</h3>
                    <div className="space-y-4">
                      <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)] group-hover:scale-110 transition-transform">
                            <Fingerprint size={28} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-zinc-200">Biometric Unlock</p>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">Use TouchID or FaceID to unlock vault</p>
                          </div>
                        </div>
                        <Toggle enabled={true} onChange={() => { }} />
                      </div>

                      <div className="p-6 rounded-[2rem] bg-black/20 border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                        <div className="flex items-center gap-5">
                          <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:scale-110 transition-transform">
                            <Clock size={28} />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-zinc-200">Auto-lock Timer</p>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">Lock vault after inactivity</p>
                          </div>
                        </div>
                        <select
                          value={autoLockTimer}
                          onChange={(e) => setAutoLockTimer(Number(e.target.value))}
                          className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none focus:border-emerald-500 transition-colors cursor-pointer"
                        >
                          <option value={5}>5 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={60}>1 hour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <Button variant="outline" className="w-full py-5 rounded-2xl border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-all font-bold">
                      Change Vault Passcode
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <h3 className="text-xl font-bold text-zinc-100">Encrypted Alerts</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors">
                      <span className="text-sm font-bold text-zinc-300">Report Status Updates</span>
                      <Toggle
                        enabled={notifications.reportUpdates}
                        onChange={() => toggleNotification('reportUpdates')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors">
                      <span className="text-sm font-bold text-zinc-300">Network Health Alerts</span>
                      <Toggle
                        enabled={notifications.networkAlerts}
                        onChange={() => toggleNotification('networkAlerts')}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-colors">
                      <span className="text-sm font-bold text-zinc-300">Security & Login Warnings</span>
                      <Toggle
                        enabled={notifications.securityWarnings}
                        onChange={() => toggleNotification('securityWarnings')}
                      />
                    </div>
                  </div>
                  <div className="p-6 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex gap-4 items-start shadow-inner">
                    <ShieldCheck size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-500/80 leading-relaxed font-medium">
                      Privacy Note: Notifications are delivered via a local service worker and never leave your device unencrypted. No central server can read these alerts.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-zinc-100">Network Configuration</h3>
                    <div className="p-8 rounded-[2rem] bg-black/20 border border-white/5 space-y-6 shadow-inner">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6 last:border-0 last:pb-0">
                        <span className="text-sm font-bold text-zinc-400">Relayer Protocol</span>
                        <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">VEIL-v2-Onion</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-bold text-zinc-400">IPFS Gateway</span>
                        <span className="text-xs font-mono text-zinc-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">https://ipfs.veil.io</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <div className="p-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 space-y-6 backdrop-blur-md">
                      <div className="flex items-center gap-4 text-red-500">
                        <div className="p-3 bg-red-500/10 rounded-xl">
                          <AlertTriangle size={24} />
                        </div>
                        <h4 className="font-bold text-xl">Danger Zone</h4>
                      </div>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                        Wiping your vault will permanently delete your identity and all associated reports from this device. High anonymity mode means this action is <span className="text-red-400 font-bold">irreversible</span>.
                      </p>
                      <Button
                        variant="secondary"
                        className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 py-5 rounded-2xl font-bold transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-red-500/5"
                        onClick={handleWipeVault}
                      >
                        <Trash2 size={20} className="mr-2" /> WIPE VAULT & IDENTITY
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
