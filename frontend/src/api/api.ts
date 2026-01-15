/**
 * API Client for Project VEIL
 * Connects to the Relayer Backend for report submission and retrieval.
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  timestamp: string | number;
  status: 'pending' | 'verified' | 'flagged' | 'spam';
  txHash?: string;
  userCommitment: string; 
  attachments?: number;
  ipfsCid: string;
  zkProof?: string; // Optional in frontend view
}

export interface UserReputation {
  commitment: string;
  score: number;
  level: 'Novice' | 'Trusted' | 'Elite' | 'Suspicious';
}

export const api = {
  /**
   * Organization Login
   */
  loginOrg: async (orgId: string, accessKey: string): Promise<ApiResponse<{ token: string; name: string }>> => {
    try {
        const res = await axios.post(`${API_URL}/login-org`, { orgId, accessKey });
        return res.data;
    } catch (error: any) {
        return { success: false, error: 'Invalid Credentials' };
    }
  },

  /**
   * Submit a new anonymous report
   */
  submitReport: async (report: any): Promise<ApiResponse<{ reportId: string; txHash: string }>> => {
    try {
        const res = await axios.post(`${API_URL}/submit-report`, report);
        return { success: true, data: res.data };
    } catch (error: any) {
        console.error("API Submit Error:", error);
        return { 
            success: false, 
            error: error.response?.data?.error || error.message || 'Submission failed' 
        };
    }
  },

  getReportStatus: async (reportId: string): Promise<ApiResponse<{ status: string }>> => {
    try {
        const response = await axios.get(`${API_URL}/report/${reportId}/status`);
        return response.data;
    } catch (error) {
        return { success: false, error: 'Fetch failed' };
    }
  },

  /**
   * Fetch reports for admin
   */
  getReports: async (status?: string): Promise<ApiResponse<ReportSubmission[]>> => {
    try {
        const params = status ? { status } : {};
        const res = await axios.get(`${API_URL}/reports`, { params });
        return { success: true, data: res.data.data };
    } catch (error: any) {
        console.error("API Fetch Error:", error);
        return { 
            success: false, 
            error: error.response?.data?.error || 'Failed to fetch' 
        };
    }
  },

  /**
   * Update Report Status
   */
  updateReportStatus: async (reportId: string, newStatus: ReportSubmission['status']): Promise<ApiResponse<ReportSubmission>> => {
    try {
        await axios.post(`${API_URL}/update-status`, { reportId, status: newStatus });
        return { success: true, data: { status: newStatus } as any };
    } catch (error: any) {
         return { success: false, error: 'Update failed' };
    }
  },

  /**
   * Get User Reputation
   */
  getUserReputation: async (commitment: string): Promise<ApiResponse<UserReputation>> => {
    try {
        const res = await axios.get(`${API_URL}/reputation/${commitment}`);
        return { success: true, data: res.data.data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch reputation' };
    }
  }
};
