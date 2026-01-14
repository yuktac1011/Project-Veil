import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, SearchX, Ghost, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 blur-[120px] rounded-full -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-12 max-w-lg"
      >
        <div className="relative inline-block">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="h-32 w-32 rounded-[2.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-500/20"
          >
            <Ghost size={64} />
          </motion.div>
          <div className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-500 shadow-2xl">
            <SearchX size={24} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative inline-block">
            <h1 className="text-8xl font-black tracking-tighter text-zinc-900 select-none">404</h1>
            <motion.div 
              animate={{ x: [-2, 2, -2], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center text-8xl font-black tracking-tighter text-emerald-500/10"
            >
              404
            </motion.div>
          </div>
          <h2 className="text-3xl font-bold">Signal Lost</h2>
          <p className="text-zinc-400 leading-relaxed">
            The encrypted path you are looking for does not exist or has been purged from the network relay.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            className="w-full sm:w-auto" 
            onClick={() => navigate('/')}
          >
            <Home className="mr-2" size={20} /> Return to Home
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2" size={20} /> Go Back
          </Button>
        </div>

        <div className="pt-12 flex items-center justify-center gap-3 text-zinc-600">
          <Shield size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol 404: Route Purged</span>
        </div>
      </motion.div>

      {/* Decorative Glitch Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <div className="h-px w-full bg-emerald-500 absolute top-1/4 animate-pulse" />
        <div className="h-px w-full bg-emerald-500 absolute top-2/4 animate-pulse delay-75" />
        <div className="h-px w-full bg-emerald-500 absolute top-3/4 animate-pulse delay-150" />
      </div>
    </div>
  );
};
