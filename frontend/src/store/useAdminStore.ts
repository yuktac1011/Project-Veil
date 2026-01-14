import { create } from 'zustand';
import { Report } from './useReportStore';

export interface AdminReport extends Report {
  category: 'Corruption' | 'Environmental' | 'Human Rights' | 'Financial';
  reputationScore: number; // 0-100
  folder: 'inbox' | 'verified' | 'spam' | 'flagged';
  description: string;
  evidenceCount: number;
}

export interface UserReputation {
  commitment: string;
  score: number;
  reportsSubmitted: number;
  reportsVerified: number;
  status: 'trusted' | 'neutral' | 'suspicious';
}

interface AdminState {
  adminReports: AdminReport[];
  userReputations: UserReputation[];
  stats: {
    totalReports: number;
    verificationRate: number;
    activeInvestigators: number;
    networkHealth: number;
  };
  
  // Actions
  moveReport: (reportId: string, folder: AdminReport['folder']) => void;
  updateReputation: (commitment: string, delta: number) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  adminReports: [
    { 
      id: '1', 
      title: 'Corporate Tax Evasion - Tech Corp', 
      status: 'verified', 
      date: '2024-03-10', 
      cid: 'QmXoyp...8921',
      category: 'Financial',
      reputationScore: 92,
      folder: 'verified',
      description: 'Detailed evidence of offshore accounts and shell companies used to bypass regional tax laws.',
      evidenceCount: 14
    },
    { 
      id: '2', 
      title: 'Environmental Violation - River Site', 
      status: 'pending', 
      date: '2024-03-12', 
      cid: 'QmZtrq...4432',
      category: 'Environmental',
      reputationScore: 45,
      folder: 'inbox',
      description: 'Illegal chemical dumping occurring during late-night shifts at the industrial park.',
      evidenceCount: 3
    },
    { 
      id: '3', 
      title: 'Unverified Crypto Scheme', 
      status: 'rejected', 
      date: '2024-03-13', 
      cid: 'QmAbc...1122',
      category: 'Financial',
      reputationScore: 12,
      folder: 'spam',
      description: 'Promotional material for a suspected rug-pull disguised as a whistleblower report.',
      evidenceCount: 1
    },
    { 
      id: '4', 
      title: 'Supply Chain Labor Abuse', 
      status: 'pending', 
      date: '2024-03-14', 
      cid: 'QmYhh...9900',
      category: 'Human Rights',
      reputationScore: 78,
      folder: 'inbox',
      description: 'Evidence of forced labor in the secondary manufacturing facilities.',
      evidenceCount: 8
    }
  ],
  userReputations: [
    { commitment: '0x7d2...f91a', score: 94, reportsSubmitted: 12, reportsVerified: 11, status: 'trusted' },
    { commitment: '0xbc1...33e2', score: 42, reportsSubmitted: 3, reportsVerified: 1, status: 'neutral' },
    { commitment: '0x11a...bb22', score: 8, reportsSubmitted: 5, reportsVerified: 0, status: 'suspicious' },
  ],
  stats: {
    totalReports: 1248,
    verificationRate: 68,
    activeInvestigators: 24,
    networkHealth: 99.9
  },

  moveReport: (reportId, folder) => set((state) => ({
    adminReports: state.adminReports.map(r => 
      r.id === reportId ? { ...r, folder, status: folder === 'verified' ? 'verified' : folder === 'spam' ? 'rejected' : 'pending' } : r
    )
  })),

  updateReputation: (commitment, delta) => set((state) => ({
    userReputations: state.userReputations.map(u => 
      u.commitment === commitment ? { ...u, score: Math.max(0, Math.min(100, u.score + delta)) } : u
    )
  }))
}));
