import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, SearchX, Ghost, Home } from 'lucide-react';

import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-emerald-900/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center w-full max-w-2xl relative z-10"
      >
        <div className="relative inline-block mb-12">
          <motion.div
            animate={{
              scale: [1, 1.02, 1],
              rotate: [0, 1, -1, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="h-40 w-40 rounded-[2.5rem] bg-zinc-900/30 border border-white/5 flex items-center justify-center text-emerald-500/20 backdrop-blur-2xl shadow-2xl relative z-10"
          >
            <Ghost size={80} />
          </motion.div>
          {/* Floating badge */}
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-2xl bg-[#09090b] border border-zinc-800 flex items-center justify-center text-emerald-500 shadow-2xl z-20">
            <SearchX size={32} />
          </div>
          {/* Decorative halo */}
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl -z-10 rounded-full" />
        </div>

        <div className="space-y-6 mb-12">
          <div className="relative inline-block">
            <h1 className="text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/10 select-none">404</h1>
            <motion.div
              animate={{ x: [-2, 2, -2], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center text-9xl font-black tracking-tighter text-emerald-500/10 mix-blend-overlay"
            >
              404
            </motion.div>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-white">Signal Lost</h2>
            <p className="text-zinc-400 leading-relaxed text-lg max-w-md mx-auto">
              The encrypted path you are looking for does not exist or has been purged from the network relay.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-6 rounded-2xl bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/5 font-semibold text-base transition-all"
            onClick={() => navigate('/')}
          >
            <Home className="mr-2" size={20} /> Return to Home
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-6 rounded-2xl border-white/10 hover:bg-white/5 hover:text-white text-zinc-400 font-semibold text-base transition-all"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2" size={20} /> Go Back
          </Button>
        </div>

        <div className="pt-16 flex items-center justify-center gap-3 opacity-60">
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent w-full max-w-[100px]" />
          <div className="flex items-center gap-2 text-zinc-600">
            <Shield size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol 404</span>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent w-full max-w-[100px]" />
        </div>
      </motion.div>

      {/* Decorative Glitch Lines - Subtler */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent absolute top-1/4 animate-pulse opacity-20" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent absolute top-2/4 animate-pulse delay-75 opacity-20" />
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent absolute top-3/4 animate-pulse delay-150 opacity-20" />
      </div>
    </div>
  );
};
