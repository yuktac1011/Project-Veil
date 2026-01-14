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
        <h1 className="text-3xl font-bold text-zinc-100">Reputation Management</h1>
        <p className="text-zinc-400 mt-1">Tracking anonymous trust scores across the network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
            <Shield size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-100">94%</p>
          <p className="text-xs text-zinc-500 mt-1">Average Network Trust</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Users size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-100">1,204</p>
          <p className="text-xs text-zinc-500 mt-1">Unique Commitments</p>
        </div>
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-6">
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
            <TrendingUp size={20} />
          </div>
          <p className="text-2xl font-bold text-zinc-100">88%</p>
          <p className="text-xs text-zinc-500 mt-1">Verification Accuracy</p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800/50 bg-zinc-950/30">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Anonymous Commitment</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Trust Score</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Submissions</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Verified</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {userReputations.map((user) => (
              <tr key={user.commitment} className="hover:bg-zinc-800/20 transition-colors group">
                <td className="px-6 py-4">
                  <code className="text-xs text-zinc-400 font-mono">{user.commitment}</code>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={clsx(
                          "h-full rounded-full",
                          user.score > 70 ? "bg-emerald-500" : user.score > 30 ? "bg-amber-500" : "bg-red-500"
                        )} 
                        style={{ width: `${user.score}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-zinc-200">{user.score}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{user.reportsSubmitted}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">{user.reportsVerified}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
                    user.status === 'trusted' ? 'bg-emerald-500/10 text-emerald-500' :
                    user.status === 'neutral' ? 'bg-zinc-800 text-zinc-400' :
                    'bg-red-500/10 text-red-500'
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
