import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full text-center space-y-8 relative z-10"
          >
            <div className="flex justify-center">
              <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <ShieldAlert size={40} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">System Kernel Panic</h1>
              <p className="text-zinc-400">
                An unexpected cryptographic error has occurred. The secure session has been suspended to protect your identity.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={14} />
                <span className="text-xs font-bold uppercase tracking-wider">Error Log</span>
              </div>
              <code className="text-[10px] font-mono text-zinc-500 break-all">
                {this.state.error?.message || 'Unknown Exception'}
              </code>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full py-6" onClick={this.handleReset}>
                <RefreshCw className="mr-2" size={18} /> Reboot System
              </Button>
              <p className="text-xs text-zinc-500">
                Your local vault remains encrypted and safe.
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
