import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  Users,
  ChevronRight
} from 'lucide-react';
import { api, ReportSubmission } from '../../api/api';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    spam: 0
  });
  const [recentReports, setRecentReports] = useState<ReportSubmission[]>([]);

  useEffect(() => {
    api.getReports().then(res => {
      if (res.success && res.data) {
        setStats({
          total: res.data.length,
          pending: res.data.filter(r => r.status === 'pending').length,
          verified: res.data.filter(r => r.status === 'verified').length,
          spam: res.data.filter(r => r.status === 'spam').length
        });
        setRecentReports(res.data.slice(0, 5));
      }
    });
  }, []);

  const cards = [
    { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Verified Reports', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Network Health', value: '99.9%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  return (
    <div className="space-y-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Secure Validator Node</h1>
          <p className="text-zinc-400 mt-1 text-sm font-medium">Global monitoring and report verification status.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 backdrop-blur-md flex items-center gap-2.5 shadow-lg shadow-emerald-500/5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Mainnet Synced</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2rem] p-6 shadow-xl overflow-hidden cursor-default transition-colors hover:bg-white/[0.02]"
          >
            {/* Subtle Gradient Glow on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg.replace('10', '0')} to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`h-14 w-14 rounded-2xl ${card.bg} border ${card.border} flex items-center justify-center ${card.color} shadow-lg shadow-black/20 group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon size={26} />
                </div>
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                  <TrendingUp size={14} className="text-emerald-500" />
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">{card.label}</p>
              <p className="text-4xl font-bold text-zinc-100 tracking-tight leading-none group-hover:text-white transition-colors">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Trends Chart */}
        <div className="lg:col-span-2 bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <BarChart3 size={20} className="text-emerald-500" />
                Submission Volume
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Daily report submission frequency analysis</p>
            </div>
            <select className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-zinc-300 outline-none focus:ring-2 focus:ring-emerald-500/20 hover:bg-white/5 transition-colors cursor-pointer appearance-none text-center">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          <div className="h-72 flex items-end gap-4 px-2 relative z-10">
            {[40, 65, 45, 90, 55, 70, 85, 60, 75, 50, 80, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar relative h-full justify-end">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full bg-gradient-to-t from-emerald-500/10 to-emerald-500/30 group-hover/bar:from-emerald-500/20 group-hover/bar:to-emerald-500/50 transition-all duration-300 rounded-t-xl relative overflow-hidden border-t-[3px] border-emerald-500/40"
                >
                  <div className="absolute inset-0 bg-emerald-400/5 opacity-0 group-hover/bar:opacity-100 transition-opacity" />
                </motion.div>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-200 whitespace-nowrap z-20 shadow-xl translate-y-2 group-hover/bar:translate-y-0 pointer-events-none">
                  {height} Reports
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-b border-r border-zinc-800 rotate-45" />
                </div>

                <span className="text-[10px] font-bold text-zinc-600 group-hover/bar:text-emerald-500 transition-colors uppercase tracking-wider">D{i + 1}</span>
              </div>
            ))}
          </div>

          {/* Background Grid Lines */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
            <div className="h-px w-full bg-white absolute top-1/4" />
            <div className="h-px w-full bg-white absolute top-2/4" />
            <div className="h-px w-full bg-white absolute top-3/4" />
          </div>
        </div>

        {/* System Alerts & Health */}
        <div className="space-y-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-b from-amber-500/5 to-black/20 border border-amber-500/10 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-3 relative z-10">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <AlertTriangle size={18} />
              </div>
              System Alerts
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 hover:bg-amber-500/5 transition-colors cursor-default">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-amber-400">High Volume Warning</p>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">Unusual spike in reports detected from Region-04. Verify standard deviation.</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 hover:bg-emerald-500/5 transition-colors cursor-default">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-emerald-400">Node Sync Complete</p>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">All 128 validator nodes are currently in sync with the mainnet.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-xl"
          >
            <h3 className="text-sm font-bold text-zinc-100 mb-6 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Users size={18} />
              </div>
              Network Reputation
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-xs text-zinc-500 font-medium">Elite Reporters</span>
                <span className="text-sm font-bold text-zinc-200">12</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-xs text-zinc-500 font-medium">Trusted Sources</span>
                <span className="text-sm font-bold text-zinc-200">148</span>
              </div>
              <div className="flex justify-between items-center px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                <span className="text-xs text-zinc-500 font-medium">Suspicious Activity</span>
                <span className="text-sm font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md">3</span>
              </div>
              <button
                onClick={() => navigate('/admin/reputation')}
                className="w-full py-3 mt-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-all shadow-lg hover:shadow-xl"
              >
                Manage Reputation
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-black/20 border border-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Activity size={20} className="text-emerald-500" />
              Recent Triage Activity
            </h3>
            <p className="text-xs text-zinc-500 mt-1">Real-time feed of submitted reports awaiting action.</p>
          </div>
          <button
            onClick={() => navigate('/admin/reports/inbox')}
            className="text-xs font-bold text-zinc-500 hover:text-emerald-500 transition-colors flex items-center gap-2 group px-4 py-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20"
          >
            All Reports <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="divide-y divide-white/5">
          {recentReports.map((report) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              key={report.id}
              onClick={() => navigate(`/admin/reports/${report.status === 'pending' ? 'inbox' : report.status}`)}
              className="p-5 cursor-pointer flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-5">
                <div className={clsx(
                  "h-12 w-12 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-lg",
                  report.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-900/10' :
                    report.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-900/10' :
                      'bg-red-500/10 text-red-500 border-red-500/20 shadow-red-900/10'
                )}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200 group-hover:text-emerald-500 transition-colors">{report.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded">{report.category}</span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(report.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Status</p>
                  <div className={clsx(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                    report.status === 'verified' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' :
                      report.status === 'pending' ? 'bg-amber-500/5 border-amber-500/20 text-amber-500' :
                        'bg-red-500/5 border-red-500/20 text-red-500'
                  )}>
                    <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse",
                      report.status === 'verified' ? 'bg-emerald-500' :
                        report.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                    )} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{report.status}</span>
                  </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:border-emerald-500 group-hover:text-black transition-all duration-300 shadow-lg">
                  <ChevronRight size={18} className="text-zinc-500 group-hover:text-black transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
