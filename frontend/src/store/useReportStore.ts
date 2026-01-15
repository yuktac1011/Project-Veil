import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Activity {
  id: string;
  type: 'submission' | 'zk_proof' | 'network' | 'security';
  message: string;
  timestamp: string;
  status: 'success' | 'pending' | 'info';
  hash?: string;
}

export interface Report {
  id: string;
  title: string;
  status: 'pending' | 'verified' | 'rejected' | 'flagged' | 'spam';
  date: string;
  cid: string;
  category?: string;
  severity?: string;
}

interface ReportState {
  reports: Report[];
  activities: Activity[];
  anonymityScore: number;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addReport: (report: Report) => void;
  clearHistory: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      reports: [],
      activities: [],
      anonymityScore: 100, // Start with perfect score for new users
      
      addActivity: (activity) => set((state) => ({
        activities: [
          { 
            ...activity, 
            id: Math.random().toString(36).substr(2, 9), 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }, 
          ...state.activities
        ].slice(0, 50) // Keep last 50 activities
      })),

      addReport: (report) => set((state) => ({
        reports: [report, ...state.reports]
      })),

      clearHistory: () => set({ reports: [], activities: [], anonymityScore: 100 })
    }),
    {
      name: 'veil-user-storage', // unique name
      storage: createJSONStorage(() => localStorage),
    }
  )
);
