import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import { clsx } from 'clsx';

export const AdminReputation = () => {
  const { userReputations } = useAdminStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Reputation Management</h1>
        <p className="text-zinc-400 mt-1 text-sm">Tracking anonymous trust scores across the network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/20 border border-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-black/20">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
            <Shield size={20} />
          </div>
          <p className="text-3xl font-bold text-zinc-100 tracking-tight">94%</p>
          <p className="text-xs text-zinc-500 mt-1 font-bold uppercase tracking-wider">Average Network Trust</p>
        </div>
        <div className="bg-black/20 border border-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-black/20">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-4">
            <Users size={20} />
          </div>
          <p className="text-3xl font-bold text-zinc-100 tracking-tight">1,204</p>
          <p className="text-xs text-zinc-500 mt-1 font-bold uppercase tracking-wider">Unique Commitments</p>
        </div>
        <div className="bg-black/20 border border-white/5 backdrop-blur-xl rounded-3xl p-6 shadow-lg shadow-black/20">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-3xl font-bold text-zinc-100 tracking-tight">88%</p>
          <p className="text-xs text-zinc-500 mt-1 font-bold uppercase tracking-wider">Verification Accuracy</p>
        </div>
      </div>

      <div className="bg-black/20 border border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg shadow-black/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/40">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Anonymous Commitment</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Trust Score</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Submissions</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Verified</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {userReputations.map((user) => (
              <tr key={user.commitment} className="hover:bg-white/5 transition-colors group cursor-default">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/5 flex items-center justify-center">
                      <Users size={14} className="text-zinc-500 opacity-50" />
                    </div>
                    <code className="text-xs text-zinc-300 font-mono bg-black/40 px-2 py-1 rounded border border-white/5 group-hover:border-emerald-500/20 transition-colors">{user.commitment}</code>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all duration-1000 ease-out",
                          user.score > 70 ? "bg-emerald-500" : user.score > 30 ? "bg-amber-500" : "bg-red-500"
                        )}
                        style={{ width: `${user.score}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">{user.score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{user.reportsSubmitted}</td>
                <td className="px-6 py-4 text-sm text-zinc-400 font-medium">{user.reportsVerified}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1.5 w-fit border",
                    user.status === 'trusted' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      user.status === 'neutral' ? 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                  )}>
                    {user.status === 'trusted' && <CheckCircle2 size={10} />}
                    {user.status === 'suspicious' && <AlertTriangle size={10} />}
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
