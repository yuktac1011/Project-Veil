import { useState } from 'react';
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
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Visuals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-zinc-900/40 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-black blur-[80px] rounded-full opacity-80" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0, x: shake ? [-10, 10, -10, 10, 0] : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md z-10 relative"
      >
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 group pl-2"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Portal</span>
        </Link>

        {/* Glass Card */}
        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-emerald-500 mb-6 shadow-lg shadow-emerald-900/20">
              <Building2 size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3 text-white">Organization Access</h1>
            <p className="text-zinc-400 text-sm">Secure entry for network administrators.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Organization ID</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Building2 className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. ADMIN-01"
                    value={orgId}
                    onChange={(e) => setOrgId(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-700 focus:bg-black/40 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-4">Access Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-700 focus:bg-black/40 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all duration-300"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0" />
                    {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              className="w-full py-7 text-base font-semibold rounded-2xl bg-white text-black hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/5"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Authenticate <ChevronRight className="ml-2" size={18} />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2 text-zinc-500 mb-4 justify-center">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-bold">End-to-End Encrypted</span>
            </div>
            {/* Demo Credentials - Slightly cleaner look */}
            <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center text-xs space-y-1">
              <span className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Demo Access</span>
              <div className="flex gap-4">
                <span className="text-zinc-400">ID: <code className="text-zinc-200 font-mono bg-white/5 px-1.5 py-0.5 rounded">ADMIN-01</code></span>
                <span className="text-zinc-400">Key: <code className="text-zinc-200 font-mono bg-white/5 px-1.5 py-0.5 rounded">veil-2025</code></span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
