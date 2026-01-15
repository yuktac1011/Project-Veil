import { motion } from 'framer-motion';
import {
    Users, Shield, Activity, Globe,
    ArrowUpRight, Zap, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useReportStore } from '../../store/useReportStore';

export const CommunityDashboard = () => {
    const { reports } = useReportStore();

    const totalVotes = reports.reduce((acc, r) => acc + (r.votes?.truth || 0) + (r.votes?.spam || 0), 0);
    const verifiedCount = reports.filter(r => r.status === 'verified').length;
    const activeVerifiers = 1240; // Mocked for now

    const stats = [
        {
            label: 'Active Verifiers',
            value: activeVerifiers.toLocaleString(),
            change: '+12%',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Community Consensus',
            value: verifiedCount.toString(),
            change: '+5 this week',
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            label: 'Total Votes Cast',
            value: totalVotes.toLocaleString(),
            change: '+84 today',
            icon: Activity,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20'
        },
        {
            label: 'Network Health',
            value: '98.2%',
            change: 'Stable',
            icon: Globe,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        }
    ];

    return (
        <div className="space-y-10 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-100 tracking-tight">Network Overview</h1>
                    <p className="text-zinc-500 mt-2 font-medium">Real-time metrics of the decentralized verification network.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <Zap size={14} /> Live Mainnet
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`p-6 rounded-[2rem] bg-black/40 border backdrop-blur-xl hover:bg-white/5 transition-all group ${stat.border}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shadow-lg`}>
                                <stat.icon size={22} />
                            </div>
                            <span className="flex items-center text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
                                <TrendingUp size={12} className="mr-1 text-emerald-500" /> {stat.change}
                            </span>
                        </div>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                        <p className="text-3xl font-bold text-zinc-100 mt-1">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Network Activity Map Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-black/20 border border-white/5 rounded-[2.5rem] p-8 min-h-[400px] flex flex-col relative overflow-hidden backdrop-blur-xl shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <h3 className="text-xl font-bold text-zinc-100">Global Verification Map</h3>
                        <button className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                            VIEW LIVE NODES <ArrowUpRight size={14} />
                        </button>
                    </div>

                    <div className="flex-1 rounded-[1.5rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center relative overflow-hidden group">
                        {/* Abstract Map Graphic */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50" />
                        <Globe size={64} className="text-indigo-500/30 animate-pulse duration-[3000ms]" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400 text-xs font-mono tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                            CONNECTING TO PEERS...
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-black/20 border border-white/5 rounded-[2.5rem] p-8 flex flex-col h-full backdrop-blur-xl"
                >
                    <h3 className="text-xl font-bold text-zinc-100 mb-6">Your Impact</h3>

                    <div className="flex-1 flex flex-col gap-6">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Reputation Score</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-emerald-500">850</span>
                                <span className="text-xs text-zinc-500 font-mono">/ 1000</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                                <div className="h-full bg-emerald-500 w-[85%]" />
                            </div>
                        </div>

                        <div className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center text-center space-y-3">
                            <Shield size={32} className="mx-auto text-zinc-600" />
                            <p className="text-sm font-medium text-zinc-400">Vote on 5 more submissions to earn the <br /><span className="text-amber-500 font-bold">"Guardian"</span> badge.</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
