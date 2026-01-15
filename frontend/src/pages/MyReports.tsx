import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  FileText,
  Clock,
  Shield,
  ChevronRight,
  ExternalLink,
  Lock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  ShieldCheck,
  Database,
  Fingerprint
} from 'lucide-react';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useReportStore, Report } from '../store/useReportStore';
import { Button } from '../components/ui/Button';
import { clsx } from 'clsx';

export const MyReports = () => {
  const navigate = useNavigate();
  const { reports } = useReportStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.cid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchQuery, filterStatus]);

  const statusIcons = {
    pending: <Clock size={14} className="text-amber-500" />,
    verified: <CheckCircle2 size={14} className="text-emerald-500" />,
    rejected: <XCircle size={14} className="text-red-500" />,
    flagged: <AlertCircle size={14} className="text-orange-500" />,
    spam: <XCircle size={14} className="text-red-500" />
  };

  // Poll for status updates for pending reports
  React.useEffect(() => {
    const checkStatuses = async () => {
      const pendingReports = reports.filter(r => r.status === 'pending');
      console.log(`[MyReports] Polling statuses for ${pendingReports.length} reports`);

      for (const report of pendingReports) {
        try {
          const res = await api.getReportStatus(report.id);
          const newStatus = res.data?.status;

          console.log(`[MyReports] Status for ${report.id}:`, newStatus);

          if (res.success && newStatus && newStatus !== report.status) {
            console.log(`[MyReports] Updating ${report.id} to ${newStatus}`);
            useReportStore.getState().updateReportStatus(report.id, newStatus as any);
          }
        } catch (e) {
          console.error(`Failed to check status for ${report.id}`, e);
        }
      }
    };

    checkStatuses();
    // Optional: Set up an interval or just run on mount
    const interval = setInterval(checkStatuses, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [reports]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all group"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Submissions</h1>
            <p className="text-zinc-500 mt-1">Manage and track your anonymous cryptographic reports.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-zinc-900/50 border border-zinc-800 p-1.5 rounded-2xl">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={clsx(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                filterStatus === status
                  ? "bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main List View */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by report title or IPFS CID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/30 border border-zinc-800 rounded-[1.5rem] py-4 pl-12 pr-4 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={clsx(
                      "group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden",
                      selectedReport?.id === report.id
                        ? "bg-emerald-500/5 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                        : "bg-zinc-900/20 border-zinc-800/50 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={clsx(
                          "h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          report.status === 'verified' ? "bg-emerald-500/10 text-emerald-500" :
                            report.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                              "bg-red-500/10 text-red-500"
                        )}>
                          <FileText size={28} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-1.5">
                            <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                              <Clock size={14} /> {report.date}
                            </span>
                            <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono">
                              <Lock size={14} /> {report.cid.slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className={clsx(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 border",
                          report.status === 'verified' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                            report.status === 'pending' ? "bg-amber-500/5 border-amber-500/20 text-amber-500" :
                              "bg-red-500/5 border-red-500/20 text-red-500"
                        )}>
                          {statusIcons[report.status]}
                          {report.status}
                        </div>
                        <ChevronRight size={24} className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center space-y-6"
                >
                  <div className="h-24 w-24 rounded-[2rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-800 mx-auto">
                    <Search size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-zinc-100">No reports found</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto">We couldn't find any submissions matching your current filters.</p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }}>
                    Clear All Filters
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail Sidebar View */}
        <AnimatePresence mode="wait">
          {selectedReport && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="w-full lg:w-[450px] bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-10 h-fit sticky top-8 backdrop-blur-xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div className={clsx(
                  "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg",
                  selectedReport.status === 'verified' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10" :
                    selectedReport.status === 'pending' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/10" :
                      "bg-red-500/10 text-red-500 shadow-red-500/10"
                )}>
                  <ShieldCheck size={32} />
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="h-10 w-10 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-2 mb-10">
                <h2 className="text-3xl font-bold text-zinc-100 leading-tight">{selectedReport.title}</h2>
                <p className="text-zinc-500 font-medium">Submitted on {selectedReport.date}</p>
              </div>

              <div className="space-y-8">
                {/* Cryptographic Identity Card */}
                <div className="p-6 rounded-[1.5rem] bg-zinc-950 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">On-Chain Identity</p>
                    <Database size={14} className="text-zinc-600" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs text-emerald-500 font-mono truncate flex-1">{selectedReport.cid}</code>
                    <button
                      className="text-zinc-500 hover:text-emerald-500 transition-colors"
                      onClick={() => selectedReport.txHash && window.open(`https://sepolia.etherscan.io/tx/${selectedReport.txHash}`, '_blank')}
                      title="View on Explorer"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Verification Timeline</h4>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-zinc-800" />

                    <div className="flex gap-5 relative z-10">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                        <Fingerprint size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Report Broadcasted</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Identity commitment verified via ZK-Proof</p>
                      </div>
                    </div>

                    <div className="flex gap-5 relative z-10">
                      <div className={clsx(
                        "h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        selectedReport.status !== 'pending' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" : "bg-zinc-900 border-zinc-800 text-zinc-700"
                      )}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Relayer Validation</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Evidence integrity check complete</p>
                      </div>
                    </div>

                    <div className="flex gap-5 relative z-10">
                      <div className={clsx(
                        "h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                        selectedReport.status === 'verified' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" :
                          selectedReport.status === 'rejected' ? "bg-red-500/20 border-red-500/30 text-red-500" :
                            "bg-zinc-900 border-zinc-800 text-zinc-700"
                      )}>
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">Final Determination</p>
                        <p className={clsx(
                          "text-xs font-black uppercase tracking-widest mt-1",
                          selectedReport.status === 'verified' ? "text-emerald-500" :
                            selectedReport.status === 'rejected' ? "text-red-500" : "text-zinc-600"
                        )}>
                          {selectedReport.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full py-6 text-lg rounded-2xl shadow-xl shadow-emerald-500/5" onClick={() => window.open(`https://gateway.pinata.cloud/ipfs/${selectedReport.cid}`, '_blank')}>
                    <div className="flex items-center">
                      <ExternalLink size={20} className="mr-3" /> <p>View Full Evidence</p>
                    </div>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
