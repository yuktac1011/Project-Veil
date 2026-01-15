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
    <div className="min-h-screen bg-[#050505] text-zinc-100 selection:bg-emerald-500/30 font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-zinc-900/30 blur-[120px] rounded-full" />
      </div>

      {/* Sticky Header */}
      <nav className="border-b border-white/5 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <Shield size={14} />
            </div>
            <span className="font-bold tracking-tighter text-sm">VEIL</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-16"
        >
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 shadow-lg shadow-white/5 mb-2">
              <Icon size={32} className="text-zinc-200" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent pb-2">
              {title}
            </h1>
            <p className="text-zinc-500 font-medium">Last updated: March 14, 2025 • Version 1.0.4-stable</p>
          </div>

          {/* Intro Card */}
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-zinc-900/20 border border-white/5 backdrop-blur-md">
            <p className="text-xl md:text-2xl text-zinc-300 leading-relaxed font-light">
              Project VEIL is a decentralized platform. These documents outline the cryptographic and legal framework that ensures your anonymity while maintaining the integrity of the network. Please read them carefully.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-24">
            {content.map((section, index) => (
              <section key={index} className="relative pl-8 md:pl-0">
                {/* Decorative Timeline Line (Desktop) */}
                <div className="hidden md:block absolute left-[-2px] top-4 bottom-[-6rem] w-[1px] bg-zinc-900"
                  style={{ display: index === content.length - 1 ? 'none' : 'block' }}></div>

                <div className="md:flex gap-10">
                  <div className="hidden md:block shrink-0 relative">
                    <div className="h-10 w-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 font-mono text-xs z-10 relative">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-zinc-100 flex items-center gap-3 md:block">
                      <span className="md:hidden text-emerald-500/50 font-mono text-sm mr-2">{String(index + 1).padStart(2, '0')}</span>
                      {section.title}
                    </h2>
                    <div className="prose prose-invert prose-zinc max-w-none">
                      <p className="text-zinc-400 leading-relaxed text-lg">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Footer Note */}
          <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
            <button className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10">
              <FileText size={18} />
              <span className="text-sm font-medium">Download Legal PDF</span>
            </button>
            <p className="text-zinc-600 text-xs text-center md:text-right">
              Questions? Contact the decentralized community <br className="hidden md:block" /> via our GitHub discussions.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
