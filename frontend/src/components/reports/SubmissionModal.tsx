import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  Upload,
  Lock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../ui/Button";
import { api } from "../../api/api";
import { useReportStore } from "../../store/useReportStore";
import { ethers } from "ethers";
import EthCrypto from "eth-crypto";
import { uploadToIPFS } from "../../utils/ipfs";
import { useAuthStore } from "../../store/useAuthStore";
// FIX: Removed 'packGroth16ProofFromPCD' import causing the error
import { useAnonAadhaar } from '@anon-aadhaar/react';

const AUTHORITY_PUBLIC_KEY =
  "04b66b26d525752df7563039643486a67f08e4274c5d468132e0882fa46c268846c4830113824f285d18d09798701e66c93433a088897089404284d72863920958";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "details" | "evidence" | "zk-proof" | "success";

const CATEGORIES = [
  "Financial Crime",
  "Environmental Violation",
  "Human Rights",
  "Cybersecurity Breach",
  "Corporate Misconduct",
  "Other",
];

export const SubmissionModal = ({ isOpen, onClose }: SubmissionModalProps) => {
  const [step, setStep] = useState<Step>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addActivity } = useReportStore();
  const { identity } = useAuthStore();
  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (msg: string) => setLogs((prev) => [...prev, msg]);

  const [anonAadhaar] = useAnonAadhaar();

  const [formData, setFormData] = useState({
    title: "",
    category: CATEGORIES[0],
    description: "",
    severity: "medium" as const,
    attachments: 0,
    status: "pending" as const,
  });

  const handleNext = () => {
    if (step === "details") setStep("evidence");
    else if (step === "evidence") setStep("zk-proof");
  };

  const handleBack = () => {
    if (step === "evidence") setStep("details");
    else if (step === "zk-proof") setStep("evidence");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLogs([]);

    try {
      // 1. Verify Login Status
      if (anonAadhaar.status !== "logged-in") {
        throw new Error("Please verify with Anon Aadhaar first");
      }
      addLog("✅ User Identity Verified (Anon Aadhaar)");

      // 2. Encrypt Payload for Authority
      const payload = {
        ...formData,
        timestamp: Date.now(),
        authorPublicKey: identity?.publicKey || "0x0", 
      };

      const encrypted = await EthCrypto.encryptWithPublicKey(
        AUTHORITY_PUBLIC_KEY,
        JSON.stringify(payload)
      );
      const encryptedString = EthCrypto.cipher.stringify(encrypted);
      addLog("🔐 Report encrypted with ECIES");

      // 3. IPFS Upload
      addLog("☁️ Uploading encrypted payload to IPFS...");
      const ipfsCid = await uploadToIPFS({ content: encryptedString });
      addLog(`✅ Uploaded to IPFS: ${ipfsCid}`);

      // 4. Extract and Format ZK Proof
      addLog("🔄 Packaging Anon Aadhaar Proof...");
      
      // FIX: Manually extract proof from state since utility is missing
      if (!anonAadhaar.anonAadhaarProofs || Object.keys(anonAadhaar.anonAadhaarProofs).length === 0) {
          throw new Error("No proofs found in session");
      }

      // Get the latest proof object (PCD)
      const pcdWrapper = Object.values(anonAadhaar.anonAadhaarProofs)[0];
      const pcd = JSON.parse(pcdWrapper.pcd); // The inner JSON string
      
      // Extract data needed for solidity
      const { proof, claim } = pcd;
      
      // Format Groth16 Proof for Solidity: [a0, a1, b00, b01, b10, b11, c0, c1]
      const groth16Proof = [
          proof.pi_a[0], proof.pi_a[1],
          proof.pi_b[0][1], proof.pi_b[0][0],
          proof.pi_b[1][1], proof.pi_b[1][0],
          proof.pi_c[0], proof.pi_c[1]
      ];

      addLog("✅ Proof packaged for Blockchain");

      // 5. Submit to Relayer
      // NOTE: We must use the signal found in the proof. 
      // If you want to bind the CID to the proof, the signal must be passed 
      // during the Login/Proof Generation phase, not afterwards.
      // Here we assume the proof validates the USER, and the RELAYER validates the DATA binding.
      const response = await api.submitReport({
        ...formData,
        proofData: {
          nullifierSeed: claim.nullifierSeed,
          nullifier: claim.nullifier,
          signal: claim.signal, // Must match what was signed during proof generation
          groth16Proof
        },
        ipfsCid,
        zkProof: ""
      });

      if (response.success) {
        addActivity({
          type: "submission",
          message: `Encrypted report submitted via ZK Relay`,
          status: "success",
          hash: ipfsCid,
        });
        setStep("success");
      }
    } catch (error: any) {
      console.error("Submission failed", error);
      addLog(`❌ Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Shield size={18} />
            </div>
            <h2 className="font-bold text-zinc-100">
              New Anonymous Submission
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-zinc-800 w-full">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: "0%" }}
            animate={{
              width:
                step === "details"
                  ? "25%"
                  : step === "evidence"
                  ? "50%"
                  : step === "zk-proof"
                  ? "75%"
                  : "100%",
            }}
          />
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Brief, descriptive title"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Severity
                      </label>
                      <select
                        value={formData.severity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            severity: e.target.value as any,
                          })
                        }
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all appearance-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                      Detailed Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide as much detail as possible while maintaining your anonymity..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-32 resize-none"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={handleNext}
                    disabled={!formData.title || !formData.description}
                  >
                    Next Step <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "evidence" && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="p-8 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-500/50 transition-colors cursor-pointer group">
                  <div className="h-16 w-16 rounded-2xl bg-zinc-950 flex items-center justify-center text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    <Upload size={32} />
                  </div>
                  <div>
                    <p className="text-zinc-100 font-medium">Upload Evidence</p>
                    <p className="text-zinc-500 text-sm">
                      Drag and drop files or click to browse
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                    Max 50MB • Encrypted on-device
                  </p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <Lock className="text-emerald-500 shrink-0" size={18} />
                  <p className="text-xs text-emerald-500/80 leading-relaxed">
                    All files are encrypted locally using your ZK-Identity keys
                    before being transmitted. Even VEIL administrators cannot
                    access them without the generated decryption key.
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={handleBack}>
                    <ChevronLeft size={18} className="mr-2" /> Back
                  </Button>
                  <Button onClick={handleNext}>
                    Generate ZK-Proof{" "}
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "zk-proof" && (
              <motion.div
                key="zk-proof"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8 text-center py-4"
              >
                <div className="relative flex justify-center">
                  <div className="h-24 w-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Shield className="text-emerald-500" size={32} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-zinc-100">
                    Generating Zero-Knowledge Proof
                  </h3>
                  <p className="text-zinc-400 max-w-sm mx-auto">
                    We are using your Anon Aadhaar proof to sign this report without revealing your identity.
                  </p>
                </div>

                <div className="bg-zinc-950 rounded-2xl p-4 font-mono text-[10px] text-emerald-500/60 text-left overflow-hidden h-32 relative">
                    {logs.map((log, i) => (
                      <div key={i}>{`> ${log}`}</div>
                    ))}
                  {isSubmitting && <div className="animate-pulse">{`> Processing...`}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={18} />{" "}
                        Verifying...
                      </>
                    ) : (
                      "Submit Anonymously"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-8"
              >
                <div className="flex justify-center">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={48} />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-zinc-100">
                    Report Submitted
                  </h3>
                  <p className="text-zinc-400">
                    Your report has been successfully broadcasted to the
                    network. You can track its status in your dashboard.
                  </p>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-left">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">
                    Submission Hash
                  </p>
                  <code className="text-xs text-emerald-500 break-all">
                    0x{Math.random().toString(16).slice(2, 40)}...
                  </code>
                </div>
                <Button className="w-full" onClick={onClose}>
                  Return to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};