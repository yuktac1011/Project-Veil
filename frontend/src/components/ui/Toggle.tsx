import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  label?: string;
}

export const Toggle = ({ enabled, onChange, label }: ToggleProps) => {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm text-zinc-300">{label}</span>}
      <button
        onClick={() => onChange(!enabled)}
        className={clsx(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
          enabled ? "bg-emerald-500" : "bg-zinc-700"
        )}
      >
        <motion.span
          animate={{ x: enabled ? 22 : 4 }}
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
        />
      </button>
    </div>
  );
};
