import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Scale, Lock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from '../constants/legalContent';

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

export const LegalPage = ({ type }: LegalPageProps) => {
  const content = type === 'terms' ? TERMS_OF_SERVICE : PRIVACY_POLICY;
  const title = type === 'terms' ? 'Terms of Service' : 'Privacy Policy';
  const Icon = type === 'terms' ? Scale : Lock;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30">
      {/* Simple Header */}
      <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm font-medium">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500" size={20} />
            <span className="font-bold tracking-tighter">VEIL</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero */}
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Icon size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
            <p className="text-zinc-500">Last updated: March 14, 2025 • Version 1.0.4-stable</p>
          </div>

          {/* Introduction */}
          <div className="p-8 rounded-3xl bg-zinc-900/40 border border-zinc-800/50">
            <p className="text-zinc-300 leading-relaxed">
              Project VEIL is a decentralized platform. These documents outline the cryptographic and legal framework that ensures your anonymity while maintaining the integrity of the network. Please read them carefully as they differ significantly from traditional centralized service agreements.
            </p>
          </div>

          {/* Main Content Sections */}
          <div className="space-y-12">
            {content.map((section, index) => (
              <section key={index} className="space-y-4">
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3">
                  <span className="text-emerald-500/50 font-mono text-sm">0{index + 1}</span>
                  {section.title}
                </h2>
                <p className="text-zinc-400 leading-relaxed pl-8">
                  {section.content}
                </p>
              </section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="pt-12 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-zinc-500 text-sm">
              <FileText size={18} />
              <span>Download as PDF</span>
            </div>
            <p className="text-zinc-600 text-xs">
              Questions? Contact the decentralized community via our GitHub discussions.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
