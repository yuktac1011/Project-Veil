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
  votes: {
    truth: number;
    spam: number;
  };
  isMine?: boolean;
}

interface ReportState {
  reports: Report[];
  activities: Activity[];
  anonymityScore: number;
  hasSeeded: boolean;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addReport: (report: Omit<Report, 'votes'>) => void;
  voteOnReport: (id: string, voteType: 'truth' | 'spam') => void;
  seedCommunityReports: () => void;
  clearHistory: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      reports: [],
      activities: [],
      anonymityScore: 100,
      hasSeeded: false,

      addActivity: (activity) => set((state) => ({
        activities: [
          {
            ...activity,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...state.activities
        ].slice(0, 50)
      })),

      addReport: (report) => set((state) => ({
        reports: [{
          id: Math.random().toString(36).substr(2, 9),
          ...report,
          votes: { truth: 0, spam: 0 },
          isMine: true
        }, ...state.reports]
      })),

      voteOnReport: (id, voteType) => set((state) => {
        const updatedReports = state.reports.map((report) => {
          if (report.id === id) {
            const newVotes = { ...report.votes };
            newVotes[voteType]++;

            let newStatus = report.status;
            const totalVotes = newVotes.truth + newVotes.spam;

            if (totalVotes >= 5) {
              if (newVotes.truth > newVotes.spam * 2) newStatus = 'verified';
              else if (newVotes.spam > newVotes.truth * 2) newStatus = 'spam';
            }

            return { ...report, votes: newVotes, status: newStatus };
          }
          return report;
        });
        return { reports: updatedReports };
      }),

      seedCommunityReports: () => {
        const state = get();
        if (state.hasSeeded) return;

        const mockReports: Report[] = [
          {
            id: 'comm-1',
            title: 'Suspicious Node Behavior in Sector 7',
            status: 'pending',
            date: '2024-03-20',
            cid: 'QmX7yZ9...8a2B',
            category: 'Network',
            votes: { truth: 12, spam: 2 },
            isMine: false
          },
          {
            id: 'comm-2',
            title: 'Unauthorized Data Access Pattern',
            status: 'verified',
            date: '2024-03-19',
            cid: 'QmP4kL2...9c4D',
            category: 'Security',
            votes: { truth: 45, spam: 1 },
            isMine: false
          },
          {
            id: 'comm-3',
            title: 'Potential Sybil Attack Detected',
            status: 'flagged',
            date: '2024-03-18',
            cid: 'QmN9jH3...4e5F',
            category: 'Attack',
            votes: { truth: 3, spam: 8 },
            isMine: false
          }
        ];

        set((state) => ({
          reports: [...state.reports, ...mockReports],
          hasSeeded: true
        }));
      },

      clearHistory: () => set({ reports: [], activities: [], anonymityScore: 100, hasSeeded: false })
    }),
    {
      name: 'veil-user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
