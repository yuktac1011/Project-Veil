import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, Lock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center z-10"
      >
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-500 mb-8">
          <ShieldAlert size={48} />
        </div>

        <h1 className="text-4xl font-bold tracking-tight mb-4">Access Denied</h1>
        <p className="text-zinc-500 mb-10 leading-relaxed">
          Your current identity does not have the required clearance level to access the administrative network. This attempt has been logged.
        </p>

        <div className="grid grid-cols-1 gap-4">
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="secondary"
            className="w-full py-6 rounded-2xl"
          >
            <Home className="mr-2" size={18} /> Return to Dashboard
          </Button>
          
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors py-2"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <div className="mt-12 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-3 text-left">
          <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-600">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Security Protocol</p>
            <p className="text-[10px] text-zinc-600 uppercase">Error Code: 403_FORBIDDEN_ACCESS</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
