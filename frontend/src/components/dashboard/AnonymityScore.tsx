import React from 'react';
import { motion } from 'framer-motion';

interface AnonymityScoreProps {
  score: number;
}

export const AnonymityScore = ({ score }: AnonymityScoreProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-32 h-32">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-zinc-800"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-emerald-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-zinc-100">{score}%</span>
        <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Secure</span>
      </div>
    </div>
  );
};
