import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ReportFormStep } from '../components/SubmissionFlow/ReportFormStep';
import { SuccessStep } from '../components/SubmissionFlow/SuccessStep';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export type SubmissionStep = 'form' | 'success';

export const SubmitReport = () => {
    const { walletAddress, zkProof } = useAuthStore();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState<SubmissionStep>('form');

    // Redirect if missing credentials
    useEffect(() => {
        if (!walletAddress || !zkProof) {
            console.log("Missing authentication data, redirecting to Auth...");
            // navigate('/auth'); // Uncomment to enforce strict auth, or allow casual browsing? 
            // The prompt says "move these setups to auth page", implying we enforce it.
            navigate('/auth');
        }
    }, [walletAddress, zkProof, navigate]);

    if (!walletAddress || !zkProof) return null; // Avoid flash

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
            {/* Header */}
            <header className="h-16 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="text-emerald-500" size={24} />
                    <span className="text-lg font-bold">Project VEIL</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div>Step: {currentStep.toUpperCase()}</div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-xs">{walletAddress.slice(0,6)}...</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[120px] rounded-full" />
                
                <div className="w-full max-w-2xl z-10">
                    <AnimatePresence mode="wait">
                        {currentStep === 'form' && (
                            <ReportFormStep 
                                key="form" 
                                proofData={zkProof}
                                walletAddress={walletAddress}
                                onSuccess={(reportId) => setCurrentStep('success')}
                            />
                        )}
                        {currentStep === 'success' && (
                            <SuccessStep key="success" />
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
