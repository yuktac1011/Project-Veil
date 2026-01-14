import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  EyeOff, 
  Zap, 
  Globe, 
  ChevronRight, 
  Check,
  MessageSquare,
  ArrowRight,
  Fingerprint,
  Database,
  Cpu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/useAuthStore';

const features = [
  {
    title: "Zero-Knowledge Proofs",
    description: "Submit reports without revealing your identity. Our Semaphore-based ZK system ensures your anonymity is mathematically guaranteed.",
    icon: Fingerprint,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10"
  },
  {
    title: "Decentralized Storage",
    description: "Evidence is encrypted and distributed across IPFS, making it immune to censorship or centralized deletion.",
    icon: Database,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  {
    title: "Onion Routing",
    description: "All submissions pass through a multi-layered relayer network, stripping away metadata and IP addresses before reaching the chain.",
    icon: Globe,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  {
    title: "Burner Wallets",
    description: "Every report generates a unique, one-time cryptographic key for tracking updates without linking back to your main identity.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  }
];

const tiers = [
  {
    name: "Citizen",
    price: "Free",
    description: "For individual whistleblowers and concerned citizens.",
    features: [
      "Anonymous ZK-Reporting",
      "Encrypted File Attachments",
      "Public Relayer Access",
      "Community Support"
    ],
    cta: "Start Reporting",
    highlight: false
  },
  {
    name: "Investigator",
    price: "$49",
    period: "/mo",
    description: "For independent journalists and private investigators.",
    features: [
      "Everything in Citizen",
      "Priority Relayer Routing",
      "Advanced Analytics Dashboard",
      "Verified Status Badge",
      "API Access (Limited)"
    ],
    cta: "Get Started",
    highlight: true
  },
  {
    name: "Organization",
    price: "Custom",
    description: "For NGOs, Law Enforcement, and Legal Firms.",
    features: [
      "Everything in Investigator",
      "Dedicated Relayer Nodes",
      "White-label Integration",
      "SLA Guarantees",
      "24/7 Direct Support"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

const testimonials = [
  {
    quote: "VEIL provided the security I needed to report corporate corruption without fearing for my career. The ZK-proofs are a game changer.",
    author: "Anonymous Whistleblower",
    role: "Fortune 500 Employee"
  },
  {
    quote: "As a journalist, verifying sources while protecting them is our biggest challenge. VEIL solves this with cryptographic certainty.",
    author: "Sarah Jenkins",
    role: "Investigative Reporter"
  }
];

export const LandingPage = () => {
  const { hasVault } = useAuthStore();
  const navigate = useNavigate();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Shield className="text-zinc-950" size={24} />
            </div>
            <span className="font-bold text-2xl tracking-tighter">VEIL</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Features</a>
            <a href="#network" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Network</a>
            <a href="#pricing" className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/auth')}
            >
              {hasVault ? 'Unlock Vault' : 'Sign In'}
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
        
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-sm mb-8"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            v1.0 Mainnet is now live
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent"
          >
            The Future of Anonymous <br /> Crime Reporting.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Project VEIL uses Zero-Knowledge cryptography and decentralized networks to empower whistleblowers while ensuring absolute anonymity.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate('/auth')}>
              Create Your Identity <ChevronRight className="ml-2" size={20} />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              View Network Stats
            </Button>
          </motion.div>
        </div>

        {/* Hero Image/Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="max-w-5xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070" 
            alt="Cyber Security Interface" 
            className="rounded-3xl border border-zinc-800 shadow-2xl opacity-50"
          />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Built on Trustless Tech</h2>
            <p className="text-zinc-400">We don't ask for your trust. We provide mathematical proof.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-all group"
              >
                <div className={`h-12 w-12 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Network Participation</h2>
            <p className="text-zinc-400">Choose the level of access that fits your mission.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                {...fadeInUp}
                transition={{ delay: i * 0.1 }}
                className={`relative p-8 rounded-3xl border ${
                  tier.highlight 
                    ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]' 
                    : 'bg-zinc-900/50 border-zinc-800'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-zinc-950 text-xs font-bold rounded-full uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{tier.price}</span>
                    {tier.period && <span className="text-zinc-500">{tier.period}</span>}
                  </div>
                  <p className="text-zinc-500 text-sm mt-4">{tier.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.features.map((f) => (
                    <div key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check size={16} className="text-emerald-500" />
                      {f}
                    </div>
                  ))}
                </div>

                <Button 
                  variant={tier.highlight ? 'primary' : 'outline'} 
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-zinc-950/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-12">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                {...fadeInUp}
                className="text-center"
              >
                <MessageSquare className="text-emerald-500/20 mx-auto mb-8" size={48} />
                <blockquote className="text-2xl md:text-3xl font-medium text-zinc-200 mb-8 italic">
                  "{t.quote}"
                </blockquote>
                <div>
                  <p className="font-bold text-zinc-100">{t.author}</p>
                  <p className="text-zinc-500 text-sm">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div 
          {...fadeInUp}
          className="max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-emerald-600 to-teal-700 p-12 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Shield size={200} className="text-white" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to make a difference?</h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of citizens using Project VEIL to build a more transparent and accountable world.
            </p>
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-zinc-100" onClick={() => navigate('/auth')}>
              Get Started Now <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Shield className="text-zinc-950" size={18} />
              </div>
              <span className="font-bold text-xl tracking-tighter">VEIL</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              The world's first decentralized anonymous crime reporting platform. Built for the people, by the people.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><Link to="/auth" className="hover:text-emerald-500 transition-colors">Submit Report</Link></li>
              <li><Link to="/auth" className="hover:text-emerald-500 transition-colors">Network Status</Link></li>
              <li><Link to="/auth" className="hover:text-emerald-500 transition-colors">ZK-Prover</Link></li>
              <li><Link to="/auth" className="hover:text-emerald-500 transition-colors">Relayer Nodes</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Security Audit</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Open Source</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-emerald-500 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © 2025 Project VEIL. All rights reserved. Cryptographically secured.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors"><Cpu size={18} /></a>
            <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors"><Globe size={18} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};
