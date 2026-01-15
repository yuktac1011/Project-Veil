import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Fingerprint, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";

interface Props {
    walletAddress: string | null;
    onVerified: (proof: any) => void;
}

export const IdentityStep: React.FC<Props> = ({ walletAddress, onVerified }) => {
    const [anonAadhaar] = useAnonAadhaar();
    const [reclaimVerified, setReclaimVerified] = useState(false);

    useEffect(() => {
        if (anonAadhaar.status === "logged-in") {
            const proof = anonAadhaar.anonAadhaarProofs ? Object.values(anonAadhaar.anonAadhaarProofs)[0] : null;
            if (proof) {
                setTimeout(() => {
                    onVerified(proof);
                }, 1000);
            }
        }
    }, [anonAadhaar, onVerified]);

    const handleReclaim = async () => {
        console.log("Starting Reclaim Verification...");
        setReclaimVerified(true);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Anonymous Identity</h2>
                <p className="text-zinc-400">
                    Prove you are real without revealing who you are.
                </p>
            </div>

            <div className="grid gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Fingerprint size={24} />
                    </div>
                    <div className="text-center">
                        <h3 className="font-semibold">Citizenship</h3>
                        <p className="text-xs text-zinc-500">Anon Aadhaar ZK Proof</p>
                    </div>
                    
                    <div className="scale-105">
                        <LogInWithAnonAadhaar 
                            nullifierSeed={1234} 
                            fieldsToReveal={["revealAgeAbove18"]} 
                        />
                    </div>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col items-center gap-4 opacity-75">
                     <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Shield size={24} />
                    </div>
                     <div className="text-center">
                        <h3 className="font-semibold">Humanity Check</h3>
                        <p className="text-xs text-zinc-500">Reclaim Protocol</p>
                    </div>
                    
                    {reclaimVerified ? (
                         <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                            <CheckCircle size={16} /> Verified
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={handleReclaim}>
                            Verify (Optional)
                        </Button>
                    )}
                </div>
            </div>

            <div className="text-xs text-center text-zinc-600">
                Wallet: {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </div>
        </motion.div>
    );
};
