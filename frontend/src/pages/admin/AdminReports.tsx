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

  // Staggered animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

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
    <div className="h-[calc(100vh-120px)] flex gap-6 pb-6">
      {/* List View */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder={`Search ${folder}...`}
              className="w-full bg-black/20 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-zinc-300 focus:bg-black/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium placeholder:text-zinc-600"
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 hover:text-white transition-all text-zinc-400">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
        </div>

        <motion.div
          className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={folder} // Re-animate on folder change
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <motion.div
                layoutId={report.id}
                variants={itemVariants}
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={clsx(
                  "p-5 rounded-[1.25rem] border transition-all cursor-pointer group relative overflow-hidden",
                  selectedReport?.id === report.id
                    ? "bg-emerald-900/10 border-emerald-500/30 shadow-[0_0_30px_-10px_rgba(16,185,129,0.2)]"
                    : "bg-black/20 border-white/5 hover:bg-white/[0.03] hover:border-white/10 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
                )}
              >
                {/* Active Indicator Line */}
                {selectedReport?.id === report.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                )}

                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                      report.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        report.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    )}>
                      {report.severity}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                      <Clock size={10} /> {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight size={14} className={clsx(
                    "transition-transform duration-300",
                    selectedReport?.id === report.id ? "text-emerald-500 translate-x-1" : "text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5"
                  )} />
                </div>
                <h4 className={clsx(
                  "text-sm font-bold mb-1.5 transition-colors",
                  selectedReport?.id === report.id ? "text-emerald-400" : "text-zinc-200 group-hover:text-white"
                )}>
                  {report.title}
                </h4>
                <p className="text-xs text-zinc-500 line-clamp-1 group-hover:text-zinc-400 transition-colors font-medium">
                  {report.description}
                </p>
              </motion.div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <div className="h-20 w-20 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-700 mb-6 shadow-inner">
                <FileText size={40} />
              </div>
              <h3 className="text-lg font-bold text-zinc-100">No reports found</h3>
              <p className="text-sm text-zinc-500 mt-2 font-medium">This folder is currently empty.</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail View */}
      <AnimatePresence mode="wait">
        {selectedReport ? (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[480px] bg-black/40 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative z-10"
          >
            <div className="p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
              <div className="flex justify-between items-start mb-6">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-900/20">
                  <Shield size={28} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedReport(null)} className="text-zinc-500 hover:text-zinc-200 hover:bg-white/5 rounded-xl">Close</Button>
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{selectedReport.title}</h3>
              <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5"><FileText size={12} /> {selectedReport.attachments} Evidence Files</span>
                <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5"><Clock size={12} /> {new Date(selectedReport.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* User Reputation Card */}
              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Anonymous Source Trust</h4>
                <div className="p-5 rounded-3xl bg-black/20 border border-white/5 flex items-center justify-between group hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
                      userRep && userRep.score > 70 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    )}>
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-200">{userRep?.level || 'Calculating...'}</p>
                      <code className="text-[10px] text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded font-mono block mt-1">{(selectedReport.userCommitment || '').slice(0, 16)}...</code>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Trust Score</p>
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className={clsx(
                        "text-2xl font-bold tracking-tight",
                        userRep && userRep.score > 70 ? "text-emerald-500" : "text-amber-500"
                      )}>{userRep?.score || 0}</span>
                      <span className="text-xs font-bold text-zinc-600">/100</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Incidence Report</h4>
                <div className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors leading-relaxed">
                  <p className="text-sm text-zinc-300 font-medium leading-7">
                    {selectedReport.description}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Cryptographic Proof</h4>
                <div className="p-5 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                  <div className="flex justify-between items-center group">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">ZK-Proof Hash</span>
                    <code className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded transition-colors group-hover:bg-emerald-500/20">{(selectedReport.zkProof || '').slice(0, 24)}...</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Verification Status</span>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Valid Signature
                    </span>
                  </div>
                  <Button variant="outline" className="w-full py-4 text-xs font-bold rounded-xl border-white/10 hover:bg-white/5 hover:text-white transition-all h-auto mt-2">
                    <ExternalLink size={14} className="mr-2" /> Verify on Block Explorer
                  </Button>
                </div>
              </section>
            </div>

            {/* Action Bar */}
            <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
              {isActioning ? (
                <div className="flex items-center justify-center py-4 bg-white/5 rounded-2xl border border-white/5">
                  <Loader2 className="animate-spin text-emerald-500 mr-2" size={20} />
                  <span className="text-sm font-medium text-zinc-300">Syncing with mainnet...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleStatusUpdate('verified')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-500 border border-transparent hover:border-emerald-500/20 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CheckCircle2 size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Verify</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('flagged')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-amber-500/10 text-zinc-500 hover:text-amber-500 border border-transparent hover:border-amber-500/20 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <AlertOctagon size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Flag</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('spam')}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Trash2 size={24} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Spam</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-[480px] bg-white/[0.02] border border-white/5 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-emerald-500/5 pointer-events-none" />
            <div className="h-20 w-20 rounded-[2rem] bg-black/40 border border-white/10 flex items-center justify-center text-zinc-600 mb-6 shadow-xl relative z-10">
              <Shield size={32} />
            </div>
            <h3 className="text-base font-bold text-zinc-300 relative z-10">Select a report to review</h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-[240px] leading-relaxed relative z-10">
              Review evidence, check reporter reputation, and verify cryptographic proofs before updating the network status.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
