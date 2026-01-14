import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, X } from 'lucide-react';
import { Button } from './Button';

export const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('veil_cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('veil_cookie_consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[60]"
        >
          <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-6 rounded-3xl shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <Shield size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-100 mb-1">Privacy Transparency</h4>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  We use local storage to secure your identity vault. No tracking cookies or third-party analytics are used. By continuing, you accept our decentralized architecture.
                </p>
                <div className="flex gap-3">
                  <Button size="sm" className="flex-1 py-2 text-xs" onClick={handleAccept}>
                    Acknowledge
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsVisible(false)}>
                    Learn More
                  </Button>
                </div>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
