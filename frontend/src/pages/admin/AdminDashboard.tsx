import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
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
    { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Verified Reports', value: stats.verified, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Network Health', value: '99.9%', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Network Command</h1>
          <p className="text-zinc-500 mt-1">Global monitoring and report verification status.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mainnet Live</span>
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
            transition={{ delay: i * 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 group hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-10 w-10 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                <card.icon size={20} />
              </div>
              <TrendingUp size={16} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-zinc-100 mt-1">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submission Trends Chart */}
        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              <BarChart3 size={20} className="text-emerald-500" />
              Submission Volume
            </h3>
            <select className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-xs text-zinc-300 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-end gap-3">
            {[40, 65, 45, 90, 55, 70, 85, 60, 75, 50, 80, 95].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  className="w-full bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all rounded-t-lg relative"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {height} reports
                  </div>
                </motion.div>
                <span className="text-[8px] text-zinc-600 font-mono">D{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* System Alerts & Health */}
        <div className="space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              System Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs font-bold text-amber-500">High Volume Warning</p>
                <p className="text-[10px] text-amber-500/70 mt-1">Unusual spike in reports from Region-04.</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xs font-bold text-emerald-500">Node Sync Complete</p>
                <p className="text-[10px] text-emerald-500/70 mt-1">All 128 validator nodes are in sync.</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-zinc-100 mb-4 flex items-center gap-2">
              <Users size={16} className="text-blue-500" />
              Network Reputation
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Elite Reporters</span>
                <span className="text-xs font-bold text-zinc-200">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Trusted Sources</span>
                <span className="text-xs font-bold text-zinc-200">148</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500">Suspicious Activity</span>
                <span className="text-xs font-bold text-red-500">3</span>
              </div>
              <button 
                onClick={() => navigate('/admin/reputation')}
                className="w-full py-2 mt-2 rounded-xl bg-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Manage Reputation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <Activity size={20} className="text-emerald-500" />
            Recent Triage Activity
          </h3>
          <button 
            onClick={() => navigate('/admin/reports/inbox')}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 group"
          >
            View Inbox <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
        <div className="divide-y divide-zinc-800">
          {recentReports.map((report) => (
            <div 
              key={report.id}
              onClick={() => navigate(`/admin/reports/${report.status === 'pending' ? 'inbox' : report.status}`)}
              className="p-4 hover:bg-zinc-800/30 transition-colors cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  report.status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' : 
                  report.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                )}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-200 group-hover:text-emerald-500 transition-colors">{report.title}</h4>
                  <p className="text-xs text-zinc-500">{report.category} • {new Date(report.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</p>
                  <p className={clsx(
                    "text-xs font-bold",
                    report.status === 'verified' ? 'text-emerald-500' : 
                    report.status === 'pending' ? 'text-amber-500' :
                    'text-red-500'
                  )}>{report.status.toUpperCase()}</p>
                </div>
                <ChevronRight size={18} className="text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
