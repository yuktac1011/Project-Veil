import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
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
  Fingerprint,
  AlertTriangle,
  Trash2
} from 'lucide-react';
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
      const isMine = report.isMine === true;
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.cid.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
      return isMine && matchesSearch && matchesFilter;
    });
  }, [reports, searchQuery, filterStatus]);

  const statusIcons: Record<string, React.ReactElement> = {
    pending: <Clock size={14} className="text-amber-500" />,
    verified: <CheckCircle2 size={14} className="text-emerald-500" />,
    rejected: <XCircle size={14} className="text-red-500" />,
    flagged: <AlertTriangle size={14} className="text-orange-500" />,
    spam: <Trash2 size={14} className="text-red-500" />
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="h-12 w-12 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all group shadow-sm hover:scale-105"
          >
            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Submissions</h1>
            <p className="text-zinc-500 mt-1 text-sm font-medium">Manage and track your anonymous cryptographic reports.</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={clsx(
                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                filterStatus === status
                  ? "text-zinc-950 shadow-lg"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
              )}
            >
              {filterStatus === status && (
                <motion.div
                  layoutId="filter-pill"
                  className="absolute inset-0 bg-emerald-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{status}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main List View */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input
              type="text"
              placeholder="Search by report title or IPFS CID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/20 border border-white/5 backdrop-blur-xl rounded-[1.5rem] py-5 pl-14 pr-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-lg"
            />
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.length > 0 ? (
                filteredReports.map((report, i) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={clsx(
                      "group p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden backdrop-blur-md shadow-lg",
                      selectedReport?.id === report.id
                        ? "bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                        : "bg-black/20 border-white/5 hover:border-emerald-500/20 hover:bg-white/5"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className={clsx(
                          "h-16 w-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border shadow-inner",
                          report.status === 'verified' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            report.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-zinc-100 group-hover:text-emerald-500 transition-colors">
                            {report.title}
                          </h3>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wide bg-white/5 px-2 py-1 rounded-md">
                              <Clock size={12} /> {report.date}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 font-mono uppercase tracking-wide bg-white/5 px-2 py-1 rounded-md group-hover:text-emerald-500/60 transition-colors">
                              <Lock size={12} /> {report.cid.slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className={clsx(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 border shadow-sm",
                          report.status === 'verified' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                            report.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                              "bg-red-500/10 border-red-500/20 text-red-500"
                        )}>
                          {statusIcons[report.status]}
                          {report.status}
                        </div>
                        <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all shadow-lg">
                          <ChevronRight size={20} className="text-zinc-500 group-hover:text-black transition-colors" />
                        </div>
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
                  <div className="h-24 w-24 rounded-[2rem] bg-black/20 border border-white/5 flex items-center justify-center text-zinc-700 mx-auto shadow-inner">
                    <Search size={48} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-zinc-100">No reports found</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto text-sm">We couldn't find any submissions matching your current filters.</p>
                  </div>
                  <Button variant="outline" onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} className="bg-white/5 border-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-xl">
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
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full lg:w-[480px] bg-black/40 border border-white/10 rounded-[2.5rem] p-8 h-fit sticky top-6 backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={clsx(
                  "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg border relative overflow-hidden group",
                  selectedReport.status === 'verified' ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500/10 border-emerald-500/20" :
                    selectedReport.status === 'pending' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/10 border-amber-500/20" :
                      "bg-red-500/10 text-red-500 shadow-red-500/10 border-red-500/20"
                )}>
                  <ShieldCheck size={32} className="relative z-10" />
                  <div className="absolute inset-0 bg-current opacity-[0.05] group-hover:opacity-[0.1] transition-opacity" />
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-white/10 transition-all hover:rotate-90"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-3 mb-10">
                <h2 className="text-3xl font-bold text-zinc-100 leading-tight tracking-tight">{selectedReport.title}</h2>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    Hash: {selectedReport.id.slice(0, 8)}
                  </span>
                  <p className="text-zinc-500 text-sm font-medium">Submitted {selectedReport.date}</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Cryptographic Identity Card */}
                <div className="p-6 rounded-[1.5rem] bg-black/20 border border-white/5 space-y-4 shadow-inner group hover:bg-black/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">On-Chain Identity</p>
                    <Database size={14} className="text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-xs text-emerald-500 font-mono truncate flex-1 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20 shadow-inner block">{selectedReport.cid}</code>
                    <button className="text-zinc-500 hover:text-emerald-500 transition-colors p-2 hover:bg-emerald-500/10 rounded-lg">
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-6 px-2">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Verification Timeline</h4>
                  <div className="space-y-8 relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-zinc-800/50" />

                    <div className="flex gap-5 relative z-10 group">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)] ring-4 ring-black/50">
                        <Fingerprint size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Report Broadcasted</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Identity commitment verified via ZK-Proof</p>
                      </div>
                    </div>

                    <div className="flex gap-5 relative z-10 group">
                      <div className={clsx(
                        "h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ring-4 ring-black/50",
                        selectedReport.status !== 'pending' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-zinc-900 border-zinc-800 text-zinc-700"
                      )}>
                        <Shield size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Relayer Validation</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Evidence integrity check complete</p>
                      </div>
                    </div>

                    <div className="flex gap-5 relative z-10 group">
                      <div className={clsx(
                        "h-8 w-8 rounded-full border flex items-center justify-center shrink-0 transition-colors ring-4 ring-black/50",
                        selectedReport.status === 'verified' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" :
                          selectedReport.status === 'rejected' ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                            "bg-zinc-900 border-zinc-800 text-zinc-700"
                      )}>
                        <AlertCircle size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">Final Determination</p>
                        <p className={clsx(
                          "text-[10px] font-black uppercase tracking-widest mt-1",
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
                  <Button className="w-full py-6 text-sm font-bold rounded-2xl shadow-xl shadow-emerald-500/10 bg-emerald-500 hover:bg-emerald-400 text-black border border-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <ExternalLink size={18} className="mr-2" /> VIEW FULL EVIDENCE
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
