import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  alias: string;
  autoLockTimer: number; // in minutes
  notifications: {
    reportUpdates: boolean;
    networkAlerts: boolean;
    securityWarnings: boolean;
  };
  theme: 'dark' | 'cyber-noir';
  
  // Actions
  setAlias: (alias: string) => void;
  setAutoLockTimer: (minutes: number) => void;
  toggleNotification: (key: keyof SettingsState['notifications']) => void;
  setTheme: (theme: 'dark' | 'cyber-noir') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      alias: 'Anonymous Agent',
      autoLockTimer: 15,
      notifications: {
        reportUpdates: true,
        networkAlerts: true,
        securityWarnings: true,
      },
      theme: 'cyber-noir',

      setAlias: (alias) => set({ alias }),
      setAutoLockTimer: (autoLockTimer) => set({ autoLockTimer }),
      toggleNotification: (key) => set((state) => ({
        notifications: {
          ...state.notifications,
          [key]: !state.notifications[key]
        }
      })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'veil-settings-storage' }
  )
);
