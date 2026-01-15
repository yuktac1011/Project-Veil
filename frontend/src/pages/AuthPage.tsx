import React, { useState, useEffect } from "react";
import { deriveIdentityFromNullifier } from "../utils/crypto";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Building2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { PasscodeGrid } from "../components/auth/PasscodeGrid";
import { Button } from "../components/ui/Button";
import { useNavigate, Link } from "react-router-dom";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";

type AuthStep = "welcome" | "create" | "passcode" | "unlock" | "recovery";

export const AuthPage = () => {
  const { hasVault, unlock, createIdentity } = useAuthStore();
  const [step, setStep] = useState<AuthStep>(hasVault ? "unlock" : "welcome");
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  // Anon Aadhaar Hook
  const [anonAadhaar] = useAnonAadhaar();
  const navigate = useNavigate();



  // ... existing imports ...

  // ...

  // Auto-unlock if vault exists (skipping passcode screen as requested)
  useEffect(() => {
    if (hasVault && step !== 'create') {
      const autoUnlock = async () => {
        try {
          await unlock("123456"); // Use the default hardcoded pin
          navigate("/dashboard");
        } catch (e) {
          console.error("Auto-unlock failed", e);
          // If auto-unlock fails (e.g. data corruption), reset to welcome
          setStep("welcome");
        }
      };
      autoUnlock();
    }
  }, [hasVault, unlock, navigate, step]);

  // Watch for Anon Aadhaar login status
  useEffect(() => {
    // Only auto-create identity if we are in the 'create' step (user explicitly asked to verify)
    // This prevents an infinite loop where a persisted AA session auto-logs you in after Veil logout
    if (anonAadhaar.status === "logged-in" && step === 'create') {
      console.log("✅ Anon Aadhaar Verified!", anonAadhaar);

      // Extract real identity from the ZK proof
      const pcdWrapper = Object.values(anonAadhaar.anonAadhaarProofs || {})[0];
      let realIdentity = {
        trapdoor: "PROTECTED_BY_AADHAAR",
        nullifier: "GENERATED_ON_CHAIN",
        commitment: "ANON_AADHAAR_USER",
        publicKey: "0x0",
      };

      if (pcdWrapper) {
        try {
          // @ts-ignore
          const pcd = JSON.parse(pcdWrapper.pcd);
          const proof = pcd.proof || {};
          const nullifier = proof.nullifier || pcd.claim?.nullifier;

          if (nullifier) {
            // Use the nullifier as the public interface identity
            realIdentity.publicKey = "0x" + BigInt(nullifier).toString(16);
            realIdentity.nullifier = nullifier;
          }
        } catch (e) {
          console.error("Failed to parse PCD for identity", e);
        }
      }

      // Auto-create identity in your store
      // We use a default pin for the MVP flow to reduce friction and strictly rely on Anon Aadhaar
      createIdentity(realIdentity, "123456");
      navigate("/dashboard");
    }
  }, [anonAadhaar.status, createIdentity, navigate, anonAadhaar, step]);

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
                  onClick={() => setStep("create")}
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

          {step === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold">Verify Citizenship</h2>
                <p className="text-zinc-400">
                  Prove you are a real person using Anon Aadhaar. Your data
                  remains local and zero-knowledge.
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 min-h-[200px]">
                {/* Anon Aadhaar Login Button */}
                <div className="scale-110">
                  <LogInWithAnonAadhaar
                    nullifierSeed={1234} // Represents your App Action ID
                    fieldsToReveal={["revealAgeAbove18", "revealPinCode"]}
                  />
                </div>

                <p className="text-zinc-500 text-sm text-center">
                  Scan your Aadhaar QR code to prove citizenship anonymously.
                </p>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("welcome")}
              >
                Back
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
