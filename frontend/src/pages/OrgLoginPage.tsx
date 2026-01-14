import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Lock, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { api } from '../api/api';
import { Button } from '../components/ui/Button';

export const OrgLoginPage = () => {
  const navigate = useNavigate();
  const { loginOrg } = useAuthStore();
  
  const [orgId, setOrgId] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    const response = await api.loginOrg(orgId, accessKey);
    
    if (response.success && response.data) {
      loginOrg({
        token: response.data.token,
        name: response.data.name,
        orgId: orgId
      });
      
      // CRITICAL: Redirect to the admin dashboard immediately after store update
      navigate('/admin-dashboard');
    } else {
      setError(response.error || 'Authentication failed');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-900/50 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: shake ? 0.4 : 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to Portal
        </Link>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mb-6">
              <Building2 size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Organization Login</h1>
            <p className="text-zinc-500">Access the Project VEIL administrative network.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Organization ID</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="text"
                    placeholder="e.g. ADMIN-01"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="password"
                    placeholder="••••••••••••"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full py-7 text-lg rounded-2xl" 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Sign In to Portal <ChevronRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t border-zinc-800/50">
            <div className="flex items-center gap-3 text-zinc-500 mb-4">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-xs font-medium">End-to-End Encrypted Session</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-2">Demo Credentials</p>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">ID: <code className="text-emerald-500">ADMIN-01</code></span>
                <span className="text-zinc-400">Key: <code className="text-emerald-500">veil-2025</code></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
