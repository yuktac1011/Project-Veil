import { create } from 'zustand';

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
  status: 'pending' | 'verified' | 'rejected';
  date: string;
  cid: string;
}

interface ReportState {
  reports: Report[];
  activities: Activity[];
  anonymityScore: number;
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [
    { id: '1', title: 'Corporate Tax Evasion - Tech Corp', status: 'verified', date: '2024-03-10', cid: 'QmXoyp...8921' },
    { id: '2', title: 'Environmental Violation - River Site', status: 'pending', date: '2024-03-12', cid: 'QmZtrq...4432' },
  ],
  activities: [
    { 
      id: 'a1', 
      type: 'zk_proof', 
      message: 'ZK-Proof generated for Report #2', 
      timestamp: '2 mins ago', 
      status: 'success',
      hash: '0x7d2...f91a'
    },
    { 
      id: 'a2', 
      type: 'network', 
      message: 'Connected to Onion Relayer Node #88', 
      timestamp: '15 mins ago', 
      status: 'info' 
    },
    { 
      id: 'a3', 
      type: 'submission', 
      message: 'Report #1 verified on-chain', 
      timestamp: '2 hours ago', 
      status: 'success',
      hash: '0xbc1...33e2'
    },
    { 
      id: 'a4', 
      type: 'security', 
      message: 'Vault unlocked via local passcode', 
      timestamp: '4 hours ago', 
      status: 'success' 
    }
  ],
  anonymityScore: 88,
  addActivity: (activity) => set((state) => ({
    activities: [
      { 
        ...activity, 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: 'Just now' 
      }, 
      ...state.activities
    ]
  }))
}));
