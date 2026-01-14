/**
 * Mock API for Project VEIL
 * Simulates backend interactions for identity, organization auth, and report management.
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ReportSubmission {
  id: string;
  title: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'pending' | 'verified' | 'flagged' | 'spam';
  zkProof: string;
  userCommitment: string; // Linked to anonymous reputation
  attachments: number;
}

export interface UserReputation {
  commitment: string;
  score: number;
  level: 'Novice' | 'Trusted' | 'Elite' | 'Suspicious';
}

// Simulated Database in LocalStorage
const getStoredReports = (): ReportSubmission[] => {
  const stored = localStorage.getItem('veil_reports');
  return stored ? JSON.parse(stored) : [
    {
      id: 'rep_1',
      title: 'Corporate Tax Evasion - Tech Corp',
      category: 'Financial Crime',
      description: 'Evidence of offshore accounts and shell companies used to bypass local tax regulations.',
      severity: 'high',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'verified',
      zkProof: '0x7d2...f91a',
      userCommitment: '0x-anon-user-1',
      attachments: 3
    }
  ];
};

const getStoredReputations = (): UserReputation[] => {
  const stored = localStorage.getItem('veil_reputations');
  return stored ? JSON.parse(stored) : [
    { commitment: '0x-anon-user-1', score: 85, level: 'Trusted' }
  ];
};

const saveReports = (reports: ReportSubmission[]) => {
  localStorage.setItem('veil_reports', JSON.stringify(reports));
};

const saveReputations = (reps: UserReputation[]) => {
  localStorage.setItem('veil_reputations', JSON.stringify(reps));
};

export const api = {
  /**
   * Organization Login
   */
  loginOrg: async (orgId: string, accessKey: string): Promise<ApiResponse<{ token: string; name: string }>> => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (orgId === 'ADMIN-01' && accessKey === 'veil-2025') {
      return {
        success: true,
        data: { token: 'mock_jwt_admin', name: 'Global Oversight Agency' }
      };
    }
    return { success: false, error: 'Invalid Organization ID or Access Key' };
  },

  /**
   * Submit a new anonymous report
   */
  submitReport: async (report: Omit<ReportSubmission, 'id' | 'timestamp' | 'status' | 'userCommitment'> & { proofData: any; ipfsCid: string }): Promise<ApiResponse<ReportSubmission>> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userCommitment = '0x-anon-user-' + Math.floor(Math.random() * 1000);
    const newReport: ReportSubmission = {
      ...report,
      id: `rep_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      userCommitment
    };

    const reports = getStoredReports();
    saveReports([newReport, ...reports]);

    // Initialize reputation if new
    const reps = getStoredReputations();
    if (!reps.find(r => r.commitment === userCommitment)) {
      reps.push({ commitment: userCommitment, score: 50, level: 'Novice' });
      saveReputations(reps);
    }

    return { success: true, data: newReport };
  },

  /**
   * Fetch reports for admin
   */
  getReports: async (status?: string): Promise<ApiResponse<ReportSubmission[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const reports = getStoredReports();
    if (status) return { success: true, data: reports.filter(r => r.status === status) };
    return { success: true, data: reports };
  },

  /**
   * Update Report Status & User Reputation (The Credit Mechanism)
   */
  updateReportStatus: async (reportId: string, newStatus: ReportSubmission['status']): Promise<ApiResponse<ReportSubmission>> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const reports = getStoredReports();
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex === -1) return { success: false, error: 'Report not found' };
    
    const report = reports[reportIndex];
    const oldStatus = report.status;
    report.status = newStatus;
    saveReports(reports);

    // Update Reputation Score
    const reputations = getStoredReputations();
    const repIndex = reputations.findIndex(r => r.commitment === report.userCommitment);
    
    if (repIndex !== -1) {
      let delta = 0;
      if (newStatus === 'verified') delta = 15;
      else if (newStatus === 'flagged') delta = -10;
      else if (newStatus === 'spam') delta = -30;

      reputations[repIndex].score = Math.max(0, Math.min(100, reputations[repIndex].score + delta));
      
      // Update Level
      const score = reputations[repIndex].score;
      if (score >= 90) reputations[repIndex].level = 'Elite';
      else if (score >= 70) reputations[repIndex].level = 'Trusted';
      else if (score >= 30) reputations[repIndex].level = 'Novice';
      else reputations[repIndex].level = 'Suspicious';

      saveReputations(reputations);
    }

    return { success: true, data: report };
  },

  /**
   * Get User Reputation by Commitment
   */
  getUserReputation: async (commitment: string): Promise<ApiResponse<UserReputation>> => {
    const reps = getStoredReputations();
    const rep = reps.find(r => r.commitment === commitment);
    return rep ? { success: true, data: rep } : { success: false, error: 'Not found' };
  }
};
