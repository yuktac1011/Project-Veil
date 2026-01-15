import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Shield,
  Activity,
  Lock,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  Zap,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useReportStore } from '../store/useReportStore';
import { SubmissionModal } from '../components/reports/SubmissionModal';
import { Button } from '../components/ui/Button';
import { clsx } from 'clsx';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { identity } = useAuthStore();
  const { reports, activities, anonymityScore } = useReportStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const recentReports = reports.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Command Center</h1>
          <p className="text-zinc-400 flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={16} className="text-emerald-500" />
            Identity Secured: <span className="font-mono text-emerald-500/80 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg text-xs border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">{identity?.publicKey.slice(0, 12)}...</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/reports')}
            className="hidden sm:flex bg-white/5 border-white/5 hover:bg-white/10 text-zinc-300 hover:text-white rounded-xl"
          >
            HISTORY
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="shadow-xl shadow-emerald-500/20 py-6 px-8 text-base bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl hover:shadow-emerald-500/30"
          >
            <Plus className="mr-2" size={20} /> NEW SUBMISSION
          </Button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl transition-all h-[260px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
            <Shield size={180} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Shield size={20} />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Anonymity Score</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-7xl font-bold text-zinc-100 tracking-tighter">{anonymityScore}</span>
              <span className="text-2xl font-bold text-zinc-600">%</span>
            </div>

            <div className="mt-auto pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Zap size={10} /> Optimal
                </div>
                <span className="text-[10px] text-zinc-500 font-medium">Top 5% of network</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${anonymityScore}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-2xl transition-all h-[260px] flex flex-col justify-between group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <FileText size={20} />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Active Reports</p>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-6xl font-bold text-zinc-100 tracking-tighter">{reports.length}</span>
              <span className="text-zinc-500 text-sm mb-2 font-medium">Total</span>
            </div>
          </div>

          <div className="flex gap-3 relative z-10">
            <div className="flex-1 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 text-center hover:bg-emerald-500/10 transition-colors group/stat cursor-pointer">
              <p className="text-[10px] text-emerald-500/70 uppercase font-black tracking-wider mb-1">Verified</p>
              <p className="text-2xl font-bold text-emerald-500 group-hover/stat:scale-110 transition-transform">{reports.filter(r => r.status === 'verified').length}</p>
            </div>
            <div className="flex-1 p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-center hover:bg-amber-500/10 transition-colors group/stat cursor-pointer">
              <p className="text-[10px] text-amber-500/70 uppercase font-black tracking-wider mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-500 group-hover/stat:scale-110 transition-transform">{reports.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl transition-all h-[260px] group overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />

          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <Activity size={20} />
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Network Status</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-6 w-6 rounded-full bg-emerald-500 animate-[ping_2s_ease-in-out_infinite] absolute inset-0 opacity-40" />
                <div className="h-6 w-6 rounded-full bg-emerald-500 relative z-10 shadow-[0_0_20px_#10b981] flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-black" />
                </div>
              </div>
              <div>
                <span className="text-3xl font-bold text-zinc-100 tracking-tight block">Encrypted</span>
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Tunnel Active</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 relative z-10 mt-auto">
            <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-zinc-400 flex items-center gap-2 font-bold"><Globe size={14} className="text-zinc-500" /> Onion Routing</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active</span>
            </div>
            <div className="flex items-center justify-between text-xs p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="text-zinc-400 flex items-center gap-2 font-bold"><Lock size={14} className="text-zinc-500" /> IP Masking</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Enabled</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                <FileText size={20} />
              </div>
              Recent Submissions
            </h2>
            <button
              onClick={() => navigate('/reports')}
              className="text-[10px] font-bold text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1 group uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-emerald-500/20"
            >
              View All <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <motion.div
                  whileHover={{ scale: 1.01, x: 5 }}
                  key={report.id}
                  onClick={() => navigate('/reports')}
                  className="bg-black/20 border border-white/5 rounded-[2rem] p-6 cursor-pointer group relative overflow-hidden backdrop-blur-md shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-zinc-200 group-hover:text-emerald-500 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5">
                          <Clock size={12} /> {report.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono text-zinc-600 group-hover:text-emerald-500/50 transition-colors px-2 py-1 rounded-md bg-white/5">
                          <Lock size={12} /> {report.cid.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-inner",
                      report.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                    )}>
                      {report.status}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-[2.5rem] space-y-4 bg-white/[0.02]">
                <div className="h-20 w-20 rounded-[2rem] bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-700 mx-auto shadow-inner">
                  <FileText size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-200 font-bold">No submissions yet</p>
                  <p className="text-zinc-500 text-sm">Your anonymous reports will appear here.</p>
                </div>
                <Button variant="ghost" onClick={() => setIsModalOpen(true)} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl">
                  Start First Report
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Log (Activity Feed) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500">
                <Activity size={20} />
              </div>
              Security Log
            </h2>
          </div>

          <div className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <Activity size={200} />
            </div>

            {activities.map((activity, idx) => (
              <div key={activity.id} className="flex gap-6 relative group">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-zinc-800/50 group-hover:bg-emerald-500/20 transition-colors" />
                )}
                <div className={clsx(
                  "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 z-10 transition-all border shadow-lg group-hover:scale-110 duration-300",
                  activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10' : 'bg-zinc-900 text-zinc-500 border-white/10'
                )}>
                  {activity.type === 'zk_proof' ? <ShieldCheck size={18} /> :
                    activity.type === 'submission' ? <CheckCircle2 size={18} /> :
                      <Activity size={18} />}
                </div>
                <div className="space-y-1.5 w-full pt-1">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-zinc-300 group-hover:text-emerald-400 transition-colors">
                      {activity.message}
                    </p>
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-lg">
                      {activity.timestamp}
                    </span>
                  </div>
                  {activity.hash && (
                    <div className="flex items-center gap-2">
                      <Shield size={10} className="text-emerald-500/50" />
                      <code className="text-[10px] text-emerald-500/60 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 hover:border-emerald-500/30 hover:text-emerald-500 transition-colors cursor-copy block w-fit">
                        {activity.hash}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <SubmissionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.div>
  );
};
