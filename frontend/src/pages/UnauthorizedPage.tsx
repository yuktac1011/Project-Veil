import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock, Home } from 'lucide-react';

import { Button } from '../components/ui/Button';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-red-500/30">
      {/* Background Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md w-full text-center z-10 relative"
      >
        <div className="inline-flex items-center justify-center h-28 w-28 rounded-[2.5rem] bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 text-red-500 mb-8 shadow-2xl shadow-red-900/20 backdrop-blur-xl">
          <ShieldAlert size={56} className="drop-shadow-lg" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Access Denied</h1>
        <p className="text-zinc-400 mb-10 leading-relaxed text-lg">
          Your current identity does not have the required clearance level to access this network.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="w-full py-6 rounded-2xl bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5 font-semibold text-base transition-all"
          >
            <Home className="mr-2" size={18} /> Return to Dashboard
          </Button>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors py-2 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <div className="mt-12 p-5 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4 text-left backdrop-blur-md">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-0.5">Security Protocol</p>
            <p className="text-xs text-red-300/70 font-mono">Error Code: 403_FORBIDDEN_ACCESS</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
