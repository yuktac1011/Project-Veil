import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, FileText, CheckCircle2, XCircle, AlertTriangle, Trash2,
    Clock, Shield, ExternalLink, ThumbsUp, ThumbsDown,
    Database, AlertCircle, Users
} from 'lucide-react';
import { useReportStore, Report } from '../../store/useReportStore';
import { Button } from '../../components/ui/Button';
import { clsx } from 'clsx';
import { useToastStore } from '../../store/useToastStore';

export const CommunityReports = () => {
    const { reports, voteOnReport, seedCommunityReports } = useReportStore();
    const { addToast } = useToastStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    useEffect(() => {
        seedCommunityReports();
    }, [seedCommunityReports]);

    // Filter reports
    const filteredReports = useMemo(() => {
        return reports.filter(report => {
            const isCommunity = !report.isMine;
            const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                report.cid.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
            return isCommunity && matchesSearch && matchesFilter;
        });
    }, [reports, searchQuery, filterStatus]);

    const handleVote = (id: string, type: 'truth' | 'spam', e: React.MouseEvent) => {
        e.stopPropagation();
        voteOnReport(id, type);
        addToast(`Voted ${type} on report`, 'success');
    };

    const statusIcons: Record<string, React.ReactElement> = {
        pending: <Clock size={14} className="text-amber-500" />,
        verified: <CheckCircle2 size={14} className="text-emerald-500" />,
        rejected: <XCircle size={14} className="text-red-500" />,
        flagged: <AlertTriangle size={14} className="text-orange-500" />,
        spam: <Trash2 size={14} className="text-red-500" />
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Community Governance</h1>
                    <p className="text-zinc-500 mt-2 text-sm font-medium">Review and vote on anonymous submissions to clean the network.</p>
                </div>
                <div className="flex items-center gap-2 bg-black/40 border border-white/5 backdrop-blur-xl p-1.5 rounded-2xl shadow-lg">
                    {(['all', 'pending', 'verified', 'rejected'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
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
                {/* Main List */}
                <div className="flex-1 space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search reports or CIDs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 backdrop-blur-xl rounded-[1.5rem] py-5 pl-14 pr-6 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-lg"
                        />
                    </div>

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
                                                            <Users size={12} /> {report.votes?.truth || 0} Votes
                                                        </span>
                                                        <span className="text-[10px] font-bold text-zinc-600 flex items-center gap-1.5 font-mono uppercase tracking-wide bg-white/5 px-2 py-1 rounded-md">
                                                            <Database size={12} /> {report.cid.slice(0, 8)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Voting Actions (Mini) */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                                    <button
                                                        onClick={(e) => handleVote(report.id, 'truth', e)}
                                                        className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all"
                                                        title="Vote as Truth"
                                                    >
                                                        <ThumbsUp size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleVote(report.id, 'spam', e)}
                                                        className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                        title="Flag as Spam"
                                                    >
                                                        <ThumbsDown size={16} />
                                                    </button>
                                                </div>

                                                <div className={clsx(
                                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 border shadow-sm",
                                                    report.status === 'verified' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                                        report.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                            "bg-red-500/10 border-red-500/20 text-red-500"
                                                )}>
                                                    {statusIcons[report.status]}
                                                    {report.status}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-4">
                                    <div className="h-20 w-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-zinc-600">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-zinc-500">No reports found matching your criteria.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Detail Panel */}
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
                                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-black tracking-widest">
                                    Hash: {selectedReport.cid.slice(0, 8)}
                                </div>
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-white/10 transition-all hover:rotate-90"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <h2 className="text-3xl font-bold text-zinc-100 leading-tight mb-2">{selectedReport.title}</h2>
                            <p className="text-zinc-500 text-sm mb-8">Submitted on {selectedReport.date}</p>

                            <div className="space-y-8">
                                {/* Voting Section */}
                                <div className="p-6 rounded-[2rem] bg-black/40 border border-white/10 shadow-inner">
                                    <h3 className="text-sm font-bold text-zinc-300 mb-6 flex items-center gap-2">
                                        <Shield size={16} className="text-emerald-500" /> Community Consensus
                                    </h3>

                                    <div className="flex gap-4 mb-6">
                                        <button
                                            onClick={(e) => handleVote(selectedReport.id, 'truth', e)}
                                            className="flex-1 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-bold hover:bg-emerald-500 hover:text-black transition-all flex flex-col items-center gap-1 group"
                                        >
                                            <ThumbsUp size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">VOTE TRUTH</span>
                                            <span className="text-xs opacity-60 font-mono">{selectedReport.votes?.truth || 0}</span>
                                        </button>
                                        <button
                                            onClick={(e) => handleVote(selectedReport.id, 'spam', e)}
                                            className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all flex flex-col items-center gap-1 group"
                                        >
                                            <ThumbsDown size={20} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">FLAG SPAM</span>
                                            <span className="text-xs opacity-60 font-mono">{selectedReport.votes?.spam || 0}</span>
                                        </button>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${((selectedReport.votes?.truth || 0) / ((selectedReport.votes?.truth || 0) + (selectedReport.votes?.spam || 0) || 1)) * 100}%` }}
                                        />
                                        <div
                                            className="h-full bg-red-500 transition-all duration-500"
                                            style={{ width: `${((selectedReport.votes?.spam || 0) / ((selectedReport.votes?.truth || 0) + (selectedReport.votes?.spam || 0) || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                        <span>Trusted</span>
                                        <span>Spam</span>
                                    </div>
                                </div>

                                {/* Evidence Link */}
                                <div className="p-6 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText size={18} className="text-zinc-400" />
                                        <span className="text-sm font-bold text-zinc-300">Evidence Payload</span>
                                    </div>
                                    <Button variant="outline" className="text-xs h-8 border-white/10 hover:bg-white/10">
                                        <ExternalLink size={12} className="mr-2" /> View
                                    </Button>
                                </div>

                                <div className="p-6 rounded-[1.5rem] bg-amber-500/5 border border-amber-500/10">
                                    <div className="flex gap-3">
                                        <AlertCircle size={20} className="text-amber-500 shrink-0" />
                                        <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
                                            <strong>Warning:</strong> Your vote is recorded on chain. Malicious voting may degrade your reputation score.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
