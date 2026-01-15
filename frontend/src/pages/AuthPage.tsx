import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Wallet, CheckCircle, Fingerprint } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Button } from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";
import { ethers } from "ethers";

type AuthStep = "welcome" | "setup";

export const AuthPage = () => {
  const { createIdentity, setWallet, setZkProof, walletAddress, zkProof } = useAuthStore();
  const [step, setStep] = useState<AuthStep>("welcome");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Anon Aadhaar Hook
  const [anonAadhaar] = useAnonAadhaar();
  const navigate = useNavigate();

  // Auto-capture Anon Aadhaar Proof
  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
       const proof = anonAadhaar.anonAadhaarProofs ? Object.values(anonAadhaar.anonAadhaarProofs)[0] : null;
       if (proof) {
           setZkProof(proof); // Save to store
       }
    }
  }, [anonAadhaar.status, setZkProof, anonAadhaar]);

  const connectWallet = async () => {
      setIsConnecting(true);
      try {
          if (!(window as any).ethereum) throw new Error("MetaMask not found");
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          if (accounts.length > 0) setWallet(accounts[0]);
      } catch (err) {
          console.error(err);
      } finally {
          setIsConnecting(false);
      }
  };

  const handleContinue = async () => {
      // Create a "User Identity" session.
      // For MVP, we use a placeholder identity object derived from nullifier or just a session flag.
      // We'll reuse the existing createIdentity for "logging in" the user in the store.
      
      let realIdentity = {
        trapdoor: "PROTECTED",
        nullifier: "UNKNOWN",
        commitment: "USER",
        publicKey: walletAddress || "0x0", 
      };

      if (zkProof) {
          // Try to extract nullifier from ZK proof if possible, or just use it as is.
          try {
             const pcd = JSON.parse(zkProof.pcd);
             const nullifier = pcd.claim?.nullifier;
             if (nullifier) realIdentity.nullifier = nullifier;
          } catch(e) {}
      }

      await createIdentity(realIdentity, "123456"); // Auto-login
      navigate("/dashboard");
  };

  const isReady = !!walletAddress && !!zkProof;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-900/50 blur-[120px] rounded-full" />

      <div className="w-full max-w-md z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Shield className="text-emerald-500" size={40} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">
                  Project VEIL
                </h1>
                <p className="text-zinc-400 text-lg">
                  Anonymous. Decentralized. Secure.
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  className="w-full py-6 text-lg"
                  onClick={() => setStep("setup")}
                >
                  Verify Citizenship
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/auth/org" className="w-full col-span-2">
                    <Button
                      variant="ghost"
                      className="w-full border border-zinc-800"
                    >
                      Org Portal
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Identity Setup</h2>
                <p className="text-zinc-400">
                    Complete these steps to access the platform.
                </p>
              </div>

              {/* 1. Wallet Connection */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                          <Wallet size={20} />
                      </div>
                      <div>
                          <h3 className="font-medium">Wallet</h3>
                          <p className="text-xs text-zinc-500">
                              {walletAddress ? `${walletAddress.slice(0,6)}...${walletAddress.slice(-4)}` : "Connect MetaMask"}
                          </p>
                      </div>
                  </div>
                  {walletAddress ? (
                      <CheckCircle className="text-emerald-500" />
                  ) : (
                      <Button size="sm" onClick={connectWallet} disabled={isConnecting}>
                          {isConnecting ? "..." : "Connect"}
                      </Button>
                  )}
              </div>

              {/* 2. Anon Aadhaar */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                          <Fingerprint size={20} />
                      </div>
                      <div>
                          <h3 className="font-medium">Citizenship</h3>
                          <p className="text-xs text-zinc-500">
                              {zkProof ? "Verified" : "Anon Aadhaar Proof"}
                          </p>
                      </div>
                  </div>
                   <div className="scale-90 origin-right">
                        {/* We use the default button but styled small */}
                        <LogInWithAnonAadhaar 
                            nullifierSeed={1234} 
                            fieldsToReveal={["revealAgeAbove18"]} 
                        />
                   </div>
              </div>

               {/* 3. Reclaim (Optional/Placeholder) */}
               <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-center justify-between opacity-75">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                          <Shield size={20} />
                      </div>
                      <div>
                          <h3 className="font-medium">Humanity</h3>
                          <p className="text-xs text-zinc-500">Reclaim Protocol (Optional)</p>
                      </div>
                  </div>
                   <Button size="sm" variant="ghost" disabled>Verify</Button>
              </div>

              <div className="pt-4 space-y-3">
                  <Button 
                    className="w-full py-6 text-lg" 
                    onClick={handleContinue}
                    disabled={!isReady}
                  >
                    Enter Veil
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("welcome")}
                  >
                    Back
                  </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
