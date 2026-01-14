import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Delete } from 'lucide-react';

interface PasscodeGridProps {
  onComplete: (passcode: string) => void;
  error?: string;
}

export const PasscodeGrid = ({ onComplete, error }: PasscodeGridProps) => {
  const [code, setCode] = useState('');

  useEffect(() => {
    if (code.length === 6) {
      onComplete(code);
      setTimeout(() => setCode(''), 500);
    }
  }, [code, onComplete]);

  const handlePress = (num: string) => {
    if (code.length < 6) setCode(prev => prev + num);
  };

  const handleDelete = () => {
    setCode(prev => prev.slice(0, -1));
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex space-x-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full transition-all duration-300 ${
              i < code.length 
                ? 'bg-emerald-500 scale-125 shadow-[0_0_10px_rgba(16,185,129,0.5)]' 
                : 'bg-zinc-700'
            } ${error && i < code.length ? 'bg-red-500' : ''}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handlePress(num.toString())}
            className="h-16 w-16 rounded-full bg-zinc-900/50 border border-zinc-800 text-xl font-light text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors active:scale-90"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handlePress('0')}
          className="h-16 w-16 rounded-full bg-zinc-900/50 border border-zinc-800 text-xl font-light text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors active:scale-90"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-16 w-16 flex items-center justify-center rounded-full text-zinc-500 hover:text-zinc-300 transition-colors active:scale-90"
        >
          <Delete size={24} />
        </button>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-sm font-medium"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
