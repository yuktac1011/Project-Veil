import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, ToastType } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="text-emerald-500" size={20} />,
  error: <AlertCircle className="text-red-500" size={20} />,
  info: <Info className="text-blue-500" size={20} />,
  warning: <AlertTriangle className="text-amber-500" size={20} />,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
            className={clsx(
              "pointer-events-auto flex items-center gap-3 min-w-[320px] p-4 rounded-2xl border backdrop-blur-xl shadow-2xl",
              "bg-zinc-900/80 border-zinc-800/50"
            )}
          >
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <p className="flex-1 text-sm font-medium text-zinc-200">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
