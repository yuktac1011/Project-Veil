import React, { useState } from 'react';
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
      className="space-y-8"
    >
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Command Center</h1>
          <p className="text-zinc-500 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Identity Secured: <span className="font-mono text-zinc-400">{identity?.publicKey.slice(0, 12)}...</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/reports')}
            className="hidden sm:flex"
          >
            History
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="shadow-lg shadow-emerald-500/20 py-6 px-8 text-lg"
          >
            <Plus className="mr-2" size={20} /> New Submission
          </Button>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          variants={itemVariants}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Anonymity Score</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-black text-emerald-500">{anonymityScore}%</span>
              <div className="mb-2">
                <div className="flex items-center gap-1 text-emerald-500/80 text-xs font-bold">
                  <Zap size={12} /> Optimal
                </div>
              </div>
            </div>
            <div className="mt-6 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${anonymityScore}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8"
        >
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Active Reports</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-6xl font-black text-zinc-100">{reports.length}</span>
            <span className="text-zinc-500 text-sm mb-2 font-medium">Total</span>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="flex-1 p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Verified</p>
              <p className="text-lg font-bold text-emerald-500">{reports.filter(r => r.status === 'verified').length}</p>
            </div>
            <div className="flex-1 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Pending</p>
              <p className="text-lg font-bold text-amber-500">{reports.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-between"
        >
          <div>
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Network Status</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative">
                <div className="h-4 w-4 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                <div className="h-4 w-4 rounded-full bg-emerald-500 relative z-10" />
              </div>
              <span className="text-2xl font-bold text-zinc-100">Encrypted</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-2"><Globe size={14} /> Onion Routing</span>
              <span className="text-emerald-500 font-bold">Active</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 flex items-center gap-2"><Lock size={14} /> IP Masking</span>
              <span className="text-emerald-500 font-bold">Enabled</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Submissions */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <FileText size={24} className="text-emerald-500" />
              Recent Submissions
            </h2>
            <button 
              onClick={() => navigate('/reports')}
              className="text-sm font-bold text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-1 group"
            >
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => navigate('/reports')}
                  className="bg-zinc-900/30 border border-zinc-800/50 rounded-[1.5rem] p-6 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-zinc-200 group-hover:text-emerald-500 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={14} /> {report.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono">
                          <Lock size={14} /> {report.cid.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                      report.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 
                      report.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                      'bg-red-500/10 text-red-500'
                    )}>
                      {report.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-[2rem] space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-700 mx-auto">
                  <FileText size={32} />
                </div>
                <div className="space-y-1">
                  <p className="text-zinc-100 font-bold">No submissions yet</p>
                  <p className="text-zinc-500 text-sm">Your anonymous reports will appear here.</p>
                </div>
                <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
                  Start First Report
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Security Log (Activity Feed) */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Activity size={24} className="text-emerald-500" />
              Security Log
            </h2>
          </div>
          
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-[2rem] p-8 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <Activity size={200} />
            </div>
            
            {activities.map((activity, idx) => (
              <div key={activity.id} className="flex gap-6 relative group">
                {idx !== activities.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-[-32px] w-[2px] bg-zinc-800 group-hover:bg-emerald-500/20 transition-colors" />
                )}
                <div className={clsx(
                  "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all",
                  activity.status === 'success' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 text-zinc-500'
                )}>
                  {activity.type === 'zk_proof' ? <Shield size={16} /> : 
                   activity.type === 'submission' ? <CheckCircle2 size={16} /> :
                   <Activity size={16} />}
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-zinc-200 group-hover:text-emerald-500 transition-colors">
                    {activity.message}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      {activity.timestamp}
                    </span>
                    {activity.hash && (
                      <span className="text-[10px] text-emerald-500/40 font-mono bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        {activity.hash}
                      </span>
                    )}
                  </div>
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
