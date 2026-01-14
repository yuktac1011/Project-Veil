import React, { useState } from 'react';
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
  ChevronRight,
  AlertTriangle,
  Camera
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
        <p className="text-zinc-400 mt-1">Manage your anonymous identity and vault security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={clsx(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-emerald-500/10 text-emerald-500" 
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8 space-y-8"
            >
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-zinc-950 text-3xl font-bold shadow-2xl shadow-emerald-500/20">
                        {identity?.publicKey.slice(2, 4).toUpperCase()}
                      </div>
                      <button className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">Identity Metadata</h3>
                      <p className="text-sm text-zinc-500">This information is stored locally on your device.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Local Alias</label>
                      <input 
                        type="text" 
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-zinc-400">Public Key (Burner)</label>
                      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5">
                        <code className="text-xs text-zinc-500 font-mono flex-1 truncate">
                          {identity?.publicKey}
                        </code>
                        <Key size={14} className="text-zinc-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-zinc-100">Vault Access</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Fingerprint size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">Biometric Unlock</p>
                            <p className="text-xs text-zinc-500">Use TouchID or FaceID to unlock vault</p>
                          </div>
                        </div>
                        <Toggle enabled={true} onChange={() => {}} />
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200">Auto-lock Timer</p>
                            <p className="text-xs text-zinc-500">Lock vault after inactivity</p>
                          </div>
                        </div>
                        <select 
                          value={autoLockTimer}
                          onChange={(e) => setAutoLockTimer(Number(e.target.value))}
                          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-sm text-zinc-300 outline-none"
                        >
                          <option value={5}>5 mins</option>
                          <option value={15}>15 mins</option>
                          <option value={30}>30 mins</option>
                          <option value={60}>1 hour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-800">
                    <Button variant="outline" className="w-full">
                      Change Vault Passcode
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-zinc-100">Encrypted Alerts</h3>
                  <div className="space-y-4">
                    <Toggle 
                      label="Report Status Updates" 
                      enabled={notifications.reportUpdates} 
                      onChange={() => toggleNotification('reportUpdates')} 
                    />
                    <Toggle 
                      label="Network Health Alerts" 
                      enabled={notifications.networkAlerts} 
                      onChange={() => toggleNotification('networkAlerts')} 
                    />
                    <Toggle 
                      label="Security & Login Warnings" 
                      enabled={notifications.securityWarnings} 
                      onChange={() => toggleNotification('securityWarnings')} 
                    />
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs text-emerald-500 leading-relaxed">
                      Note: Notifications are delivered via a local service worker and never leave your device unencrypted.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-zinc-100">Network Configuration</h3>
                    <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">Relayer Protocol</span>
                        <span className="text-xs font-mono text-zinc-500">VEIL-v2-Onion</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-300">IPFS Gateway</span>
                        <span className="text-xs font-mono text-zinc-500">https://ipfs.veil.io</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-zinc-800">
                    <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
                      <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle size={20} />
                        <h4 className="font-bold">Danger Zone</h4>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Wiping your vault will permanently delete your identity and all associated reports. This action is irreversible.
                      </p>
                      <Button 
                        variant="secondary" 
                        className="w-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border-red-500/20"
                        onClick={handleWipeVault}
                      >
                        <Trash2 size={18} className="mr-2" /> Wipe Vault & Identity
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
