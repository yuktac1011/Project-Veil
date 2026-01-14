import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertOctagon, 
  Trash2, 
  Shield, 
  Clock, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Loader2,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { api, ReportSubmission, UserReputation } from '../../api/api';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';

interface AdminReportsProps {
  folder: 'inbox' | 'verified' | 'flagged' | 'spam';
}

export const AdminReports = ({ folder }: AdminReportsProps) => {
  const [reports, setReports] = useState<ReportSubmission[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportSubmission | null>(null);
  const [userRep, setUserRep] = useState<UserReputation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);

  const fetchReports = async () => {
    setIsLoading(true);
    const statusMap = {
      inbox: 'pending',
      verified: 'verified',
      flagged: 'flagged',
      spam: 'spam'
    };
    const res = await api.getReports(statusMap[folder]);
    if (res.success) setReports(res.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [folder]);

  useEffect(() => {
    if (selectedReport) {
      api.getUserReputation(selectedReport.userCommitment).then(res => {
        if (res.success) setUserRep(res.data || null);
      });
    } else {
      setUserRep(null);
    }
  }, [selectedReport]);

  const handleStatusUpdate = async (newStatus: ReportSubmission['status']) => {
    if (!selectedReport) return;
    setIsActioning(true);
    const res = await api.updateReportStatus(selectedReport.id, newStatus);
    if (res.success) {
      setSelectedReport(null);
      fetchReports();
    }
    setIsActioning(false);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* List View */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder={`Search ${folder}...`} 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <motion.div
                layoutId={report.id}
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={clsx(
                  "p-4 rounded-2xl border transition-all cursor-pointer group",
                  selectedReport?.id === report.id 
                    ? "bg-emerald-500/5 border-emerald-500/30" 
                    : "bg-zinc-900/40 border-zinc-800/50 hover:border-zinc-700"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                      report.severity === 'critical' ? 'bg-red-500/10 text-red-500' :
                      report.severity === 'high' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    )}>
                      {report.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-600 group-hover:text-zinc-400" />
                </div>
                <h4 className="text-sm font-bold text-zinc-100 mb-1 group-hover:text-emerald-500 transition-colors">
                  {report.title}
                </h4>
                <p className="text-xs text-zinc-500 line-clamp-1">{report.description}</p>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="h-16 w-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">No reports found</h3>
              <p className="text-sm text-zinc-500 mt-1">This folder is currently empty.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <AnimatePresence mode="wait">
        {selectedReport ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-[450px] bg-zinc-900/40 border border-zinc-800/50 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-800/50 bg-zinc-900/50">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Shield size={24} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)}>Close</Button>
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-2">{selectedReport.title}</h3>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><FileText size={12} /> {selectedReport.attachments} Evidence Files</span>
                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(selectedReport.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* User Reputation Card */}
              <section className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Anonymous Source Trust</h4>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "h-10 w-10 rounded-full flex items-center justify-center",
                      userRep && userRep.score > 70 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                    )}>
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{userRep?.level || 'Loading...'}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{selectedReport.userCommitment.slice(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-400">Trust Score</p>
                    <p className={clsx(
                      "text-lg font-bold",
                      userRep && userRep.score > 70 ? "text-emerald-500" : "text-amber-500"
                    )}>{userRep?.score || 0}/100</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Report Content</h4>
                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedReport.description}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Cryptographic Proof</h4>
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">ZK-Proof Hash</span>
                    <code className="text-[10px] text-emerald-500 font-mono">{selectedReport.zkProof.slice(0, 20)}...</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500">Verification Status</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Valid Signature</span>
                  </div>
                  <Button variant="outline" className="w-full py-2 text-[10px] h-auto">
                    <ExternalLink size={12} className="mr-2" /> Verify on Explorer
                  </Button>
                </div>
              </section>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-zinc-800/50 bg-zinc-950/50">
              {isActioning ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="animate-spin text-emerald-500 mr-2" size={20} />
                  <span className="text-sm text-zinc-400">Updating network state...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleStatusUpdate('verified')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 transition-all group"
                  >
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] font-bold uppercase">Verify</span>
                    <span className="text-[8px] text-emerald-500/0 group-hover:text-emerald-500/60 transition-all">+15 Credit</span>
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('flagged')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 transition-all group"
                  >
                    <AlertOctagon size={20} />
                    <span className="text-[10px] font-bold uppercase">Flag</span>
                    <span className="text-[8px] text-amber-500/0 group-hover:text-amber-500/60 transition-all">-10 Credit</span>
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('spam')}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all group"
                  >
                    <Trash2 size={20} />
                    <span className="text-[10px] font-bold uppercase">Spam</span>
                    <span className="text-[8px] text-red-500/0 group-hover:text-red-500/60 transition-all">-30 Credit</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="w-[450px] bg-zinc-900/20 border border-zinc-800/50 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 mb-4">
              <Shield size={24} />
            </div>
            <h3 className="text-sm font-bold text-zinc-500">Select a report to review</h3>
            <p className="text-xs text-zinc-600 mt-2 max-w-[200px]">
              Review evidence and cryptographic proofs before updating report status.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
