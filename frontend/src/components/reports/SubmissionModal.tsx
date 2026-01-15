import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Upload, Lock, CheckCircle2 } from "lucide-react";
import { jsPDF } from 'jspdf';
import { useAnonAadhaar } from '@anon-aadhaar/react';
import EthCrypto from "eth-crypto";

// Internal Imports
import { api } from "../../api/api";
import { useReportStore } from "../../store/useReportStore";
import { useAuthStore } from "../../store/useAuthStore";
import { uploadToIPFS } from "../../utils/ipfs";
import { saveToQueue } from "../../utils/db";
import { useNetwork } from "../../store/useNetwork";

const AUTHORITY_PUBLIC_KEY = "048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionModal = ({ isOpen, onClose }: SubmissionModalProps) => {
  // -------------------------------------------------------------------------
  // 1. STATE MANAGEMENT
  // -------------------------------------------------------------------------
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General Incident');
  const [reportText, setReportText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Use the custom hook for online status
  const isOnline = useNetwork();

  const CATEGORIES = [
    'General Incident', 'Violent Crime', 'Theft/Property',
    'Corruption/Fraud', 'Harassment/Abuse', 'Cybercrime', 'Drug/Trafficking'
  ];

  // AI Triage State
  const [reportStatus, setReportStatus] = useState<{ status: string; message: string; reason?: string | null }>({
    status: 'IDLE',
    message: 'System Initialized',
    reason: 'Awaiting narrative input for triage analysis.'
  });

  const [piiDetected, setPiiDetected] = useState<{ type: string; value: string }[]>([]);
  const [aiMetadata, setAiMetadata] = useState({
    label: 'Unclassified',
    confidence: 0,
    summary: 'Report triage is pending local AI evaluation.'
  });

  // AI Progress
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Evidence
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<any[] | null>(null);

  // Store & Auth
  const { addReport, addActivity } = useReportStore();
  const { identity } = useAuthStore();
  const [anonAadhaar] = useAnonAadhaar();

  // Refs
  const reportTextRef = useRef('');
  const backdropRef = useRef<HTMLDivElement>(null);
  const worker = useRef<Worker | null>(null);
  const analysisTimeout = useRef<NodeJS.Timeout | null>(null);

  // Sync Ref
  useEffect(() => { reportTextRef.current = reportText; }, [reportText]);

  // -------------------------------------------------------------------------
  // 2. WORKER & PII INITIALIZATION
  // -------------------------------------------------------------------------
  const runLocalPiiScan = useCallback((text: string) => {
    const patterns = {
      email: /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g,
      phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g,
      crypto: /0x[a-fA-F0-9]{40}/g
    };
    const findings: { type: string; value: string }[] = [];

    const emails = text.match(patterns.email);
    if (emails) emails.forEach(e => findings.push({ type: 'Email', value: e }));

    const phones = text.match(patterns.phone);
    if (phones) phones.forEach(p => findings.push({ type: 'Phone', value: p }));

    const wallets = text.match(patterns.crypto);
    if (wallets) wallets.forEach(w => findings.push({ type: 'Wallet', value: w }));

    setPiiDetected(findings);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    if (!worker.current) {
      worker.current = new Worker('/aiWorker.js', { type: 'module' });
      worker.current.onerror = (err) => {
        console.error("Critical Failure: AI Worker Registry", err);
        setIsAnalyzing(false);
        setIsModelLoading(false);
        setReportStatus({ status: 'ERROR', message: 'AI Module Unavailable', reason: 'Local detection models failed to load.' });
      };
    }

    const handleAIWorkerMessage = (e: MessageEvent) => {
      const { status, data, output, error } = e.data;
      switch (status) {
        case 'loading':
          setIsModelLoading(true);
          setLoadingMessage(data.msg || 'Connecting Triage Engine...');
          if (data.status === 'progress') setLoadingProgress(data.progress || 0);
          break;
        case 'text_complete':
          setIsModelLoading(false);
          setIsAnalyzing(false);
          evaluateSystemTriage(output);
          break;
        case 'image_complete':
          setIsModelLoading(false);
          setImageAnalysis(output);
          break;
        case 'error':
          setIsModelLoading(false);
          setIsAnalyzing(false);
          setReportStatus({ status: 'ERROR', message: 'Triage Processing Error', reason: error || 'Analysis failed.' });
          break;
      }
    };

    worker.current.addEventListener('message', handleAIWorkerMessage);
    return () => worker.current?.removeEventListener('message', handleAIWorkerMessage);
  }, [isOpen]);

  // -------------------------------------------------------------------------
  // 3. LOGIC GATES
  // -------------------------------------------------------------------------
  const triggerIntelligenceScan = () => {
    const textToScan = reportTextRef.current.trim();
    if (textToScan.length < 5) return;
    setIsAnalyzing(true);
    setReportStatus({ status: 'ANALYZING', message: 'Triage in progress...', reason: null });
    worker.current?.postMessage({ text: textToScan });
  };

  useEffect(() => {
    if (!reportText) return;
    runLocalPiiScan(reportText);
    if (analysisTimeout.current) clearTimeout(analysisTimeout.current);
    setReportStatus({ status: 'ANALYZING', message: 'User typing...', reason: null });
    analysisTimeout.current = setTimeout(() => { triggerIntelligenceScan(); }, 1500);
    return () => { if (analysisTimeout.current) clearTimeout(analysisTimeout.current); };
  }, [reportText, runLocalPiiScan]);

  const evaluateSystemTriage = useCallback((data: any) => {
    const { scores, sentiment, hasContext, category: aiCatData, spam } = data;
    const currentText = reportTextRef.current;
    setAiMetadata(aiCatData);

    // Auto-suggest category if confidence is high
    if (aiCatData.confidence > 85) {
      setCategory(aiCatData.label);
    }

    if (spam?.isSpam) {
      setReportStatus({ status: 'BLOCKED', message: 'Content Flagged: Spam', reason: spam.issues.join(", ") });
      return;
    }
    if (currentText.length < 15) {
      setReportStatus({ status: 'BLOCKED', message: 'Narrative Quality Low', reason: 'Please provide a more descriptive account.' });
      return;
    }

    const isHarmful = scores?.threat > 0.85 || scores?.identity_hate > 0.85;
    if (isHarmful) {
      setReportStatus({ status: 'BLOCKED', message: 'Submission Blocked: Harmful Intent', reason: 'Threats or hate speech detected.' });
      return;
    }

    const isToxic = scores?.toxic > 0.8 || scores?.obscene > 0.8 || scores?.insult > 0.8;
    // Emotional Tone Check
    if (sentiment?.label === 'mockery') {
      setReportStatus({ status: 'BLOCKED', message: 'Report Rejected', reason: 'Tone indicates mockery/prank.' });
      return;
    }

    if (isToxic) {
      // Allow toxic content ONLY if context or distress is present
      if (hasContext || sentiment?.label === 'distress' || sentiment?.label === 'anger') {
        setReportStatus({ status: 'CAUTION', message: 'Distress Verified', reason: 'High emotion/toxicity detected, but context is valid.' });
      } else {
        setReportStatus({ status: 'BLOCKED', message: 'Blocked: Abusive Language', reason: 'Toxicity detected without valid context.' });
      }
    } else {
      setReportStatus({ status: 'SAFE', message: 'Report Integrity Verified', reason: `Triage Categorization: ${category.label}` });
    }
  }, []);

  // -------------------------------------------------------------------------
  // 4. EVIDENCE & PDF
  // -------------------------------------------------------------------------
  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File size limit exceeded (10MB Max)."); return; }
    setEvidenceFile(file);
    setImageAnalysis(null);
    const isVideo = file.type.startsWith('video');
    setFileType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result as string);
      if (!isVideo && worker.current) {
        setLoadingMessage("Scanning evidence pixel-by-pixel...");
        setIsModelLoading(true);
        worker.current.postMessage({ image: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const createSecurePDF = () => {
    const doc = new jsPDF();
    const nonce = 'VEIL-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    doc.setFillColor(16, 185, 129); // Veil Green
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("VEIL SECURE CRIME REPORT", 20, 17);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.text(`REFERENCE ID: ${nonce}`, 20, 35);
    doc.text(`GENERATED: ${new Date().toLocaleString()}`, 20, 42);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("REPORT DETAILS", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Title: ${title}`, 20, 62);
    doc.text(`Category: ${category}`, 20, 68);
    doc.text(`AI Confidence: ${aiMetadata.confidence}%`, 20, 74);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INCIDENT NARRATIVE", 20, 80);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrappedText = doc.splitTextToSize(reportText, 170);
    doc.text(wrappedText, 20, 87);

    doc.save(`VEIL_RECEIPT_${nonce}.pdf`);
  };

  const generateHighlighterMarkup = (text: string) => {
    if (!text) return { __html: '' };
    const emailP = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
    const phoneP = /([\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6})/g;
    const walletP = /(0x[a-fA-F0-9]{40})/g;

    // Escape HTML
    let safeStr = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const openM = '<mark class="bg-red-500/30 text-transparent rounded px-0.5 border-b-2 border-red-500">';
    const closeM = '</mark>';

    safeStr = safeStr.replace(emailP, `${openM}$1${closeM}`)
      .replace(phoneP, `${openM}$1${closeM}`)
      .replace(walletP, `${openM}$1${closeM}`);

    return { __html: safeStr + '<br/>' };
  };

  // -------------------------------------------------------------------------
  // 5. SUBMISSION FLOW
  // -------------------------------------------------------------------------
  const finalizeSubmission = async () => {
    setIsSubmitting(true);
    try {
      // A. Generate Receipt
      createSecurePDF();

      const dataPayload = {
        title: title || "Submitted Report",
        description: reportText,
        category: category,
        severity: reportStatus.status === 'SAFE' ? 'medium' : 'high',
        timestamp: Date.now(),
        aiAnalysis: { aiMetadata, imageAnalysis },
        attachments: evidenceFile ? 1 : 0
      };

      // B. Offline Branch
      if (!isOnline) {
        const offlineId = `local_${Date.now()}`;
        await saveToQueue({ ...dataPayload, id: offlineId, status: 'pending' });
        addReport({
          ...dataPayload,
          id: offlineId,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          cid: 'offline-pending'
        });
        alert("You are offline. Report saved securely to the queue and will sync when online.");
        onClose();
        return;
      }

      // C. Online Branch (ZK + Crypto)
      if (anonAadhaar.status !== "logged-in") throw new Error("Please verify Identity first.");

      // 1. ZK Proof Extraction
      if (!anonAadhaar.anonAadhaarProofs || Object.keys(anonAadhaar.anonAadhaarProofs).length === 0) {
        throw new Error("No proofs found in session");
      }
      const pcdWrapper = Object.values(anonAadhaar.anonAadhaarProofs)[0];
      const pcd = JSON.parse(pcdWrapper.pcd);
      const { claim } = pcd;
      const proof = pcd.proof.groth16Proof || pcd.proof;
      const groth16Proof = [
        proof.pi_a[0], proof.pi_a[1],
        proof.pi_b[0][1], proof.pi_b[0][0],
        proof.pi_b[1][1], proof.pi_b[1][0],
        proof.pi_c[0], proof.pi_c[1]
      ];

      // 2. Encryption
      const hexToUint8Array = (hexString: string) => {
        const arrayBuffer = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) arrayBuffer[i / 2] = parseInt(hexString.substr(i, 2), 16);
        return arrayBuffer;
      };
      const encrypted = await EthCrypto.encryptWithPublicKey(
        hexToUint8Array(AUTHORITY_PUBLIC_KEY) as any,
        JSON.stringify({ ...dataPayload, authorPublicKey: identity?.publicKey || "0x0" })
      );
      const encryptedString = EthCrypto.cipher.stringify(encrypted);

      // 3. IPFS
      const ipfsCid = await uploadToIPFS({ content: encryptedString });

      // 4. Relayer
      const response = await api.submitReport({
        ...dataPayload,
        proofData: {
          nullifierSeed: pcd.proof.nullifierSeed,
          nullifier: pcd.proof.nullifier,
          signal: claim.signal || claim.signalHash || "1",
          groth16Proof
        },
        ipfsCid,
        zkProof: "" // Relayer handles verification
      });

      if (response.success) {
        addReport({
          ...dataPayload,
          id: response.data?.reportId,
          status: 'pending',
          date: new Date().toISOString().split('T')[0],
          cid: ipfsCid
        });
        addActivity({ type: "submission", message: `Encrypted report submitted`, status: "success", hash: ipfsCid });
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      alert(`Submission Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const systemBlocked = reportStatus.status === 'BLOCKED';
  const hasPii = piiDetected.length > 0;
  const canSubmit = !isAnalyzing &&
    !hasPii &&
    (reportStatus.status === 'SAFE' || reportStatus.status === 'CAUTION') &&
    reportText.length > 0 &&
    title.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // Use max-h to ensure it fits on screen, scrollable
        className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 md:p-10 bg-[#0a0a0a] text-gray-100 rounded-[2.5rem] shadow-2xl border border-gray-900 custom-scrollbar"
      >
        <div className="flex justify-end mb-2">
          <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
        </div>

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-gray-900">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              <span className="text-emerald-500">PROJECT</span> VEIL
            </h1>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Secure Reporting Protocol</p>
          </div>
          <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border text-[10px] font-black tracking-widest ${isOnline ? 'border-emerald-900 bg-emerald-950/20 text-emerald-400' : 'border-orange-900 text-orange-400'}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
            {isOnline ? 'NETWORK ACTIVE' : 'OFFLINE MODE'}
          </div>
        </header>

        {/* AI LOADING */}
        {isModelLoading && (
          <div className="mb-6 p-4 bg-blue-900/10 border border-blue-900/30 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-blue-400 uppercase">{loadingMessage}</span>
              <span className="text-[10px] font-mono text-blue-300">{loadingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${loadingProgress}%` }}></div>
            </div>
          </div>
        )}

        {/* AI DASHBOARD */}
        {!isAnalyzing && aiMetadata.label !== 'Unclassified' && (
          <section className="mb-8 p-6 bg-[#0f0f0f] rounded-3xl border border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <span className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-1">Triage Analysis</span>
                <div className="text-[13px] text-gray-400 italic">"{aiMetadata.summary}"</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-purple-900/20 border border-purple-500/30 rounded-lg text-[10px] text-purple-300 font-black">{aiMetadata.label.toUpperCase()}</span>
              <span className={`px-3 py-1 border rounded-lg text-[10px] font-mono font-bold ${aiMetadata.confidence > 80 ? 'bg-emerald-900/20 text-emerald-400' : 'bg-yellow-900 text-yellow-500'}`}>{aiMetadata.confidence}% MATCH</span>
            </div>
          </section>
        )}

        {/* SYSTEM STATUS */}
        {reportStatus.status !== 'IDLE' && (
          <div className={`mb-8 p-4 rounded-2xl border flex flex-col gap-1 transition-all
                    ${reportStatus.status === 'SAFE' ? 'bg-emerald-900/10 border-emerald-900/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''}
                    ${reportStatus.status === 'CAUTION' ? 'bg-yellow-900/10 border-yellow-900/40 text-yellow-400' : ''}
                    ${reportStatus.status === 'BLOCKED' ? 'bg-red-900/10 border-red-900/50 text-red-500' : ''}
                    ${reportStatus.status === 'ANALYZING' ? 'bg-blue-900/10 border-blue-900/40 text-blue-400' : ''}
                `}>
            <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
              {reportStatus.status === 'BLOCKED' ? <Shield size={12} /> : null}
              {reportStatus.message}
            </div>
            {reportStatus.reason && <p className="text-[10px] text-gray-400 pl-6">{reportStatus.reason}</p>}
          </div>
        )}

        {/* INPUT SECTION */}
        <section className="mb-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">REPORT TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Theft at downtown metro..."
                className="w-full bg-[#111] border border-gray-900 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">CATEGORY</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#111] border border-gray-900 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-emerald-500/50 transition-colors"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest">INCIDENT NARRATIVE</label>
              {hasPii && (
                <span className="text-[9px] text-red-500 font-black bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50 animate-pulse">
                  ⚠ ANONYMITY RISK: {Array.from(new Set(piiDetected.map(p => p.type))).join(", ").toUpperCase()} DETECTED
                </span>
              )}
            </div>
            <div className="relative w-full h-64 rounded-3xl overflow-hidden border border-gray-900 bg-black/40 focus-within:border-emerald-500/30 transition-all shadow-inner">
              <div
                ref={backdropRef}
                className="absolute inset-0 p-6 whitespace-pre-wrap break-words font-sans text-[16px] leading-relaxed overflow-hidden pointer-events-none text-transparent"
                dangerouslySetInnerHTML={generateHighlighterMarkup(reportText)}
              />
              <textarea
                className="absolute inset-0 w-full h-full p-6 bg-transparent text-gray-300 text-[16px] leading-relaxed outline-none resize-none scrollbar-hide selection:bg-emerald-500/30"
                placeholder="Log incident detail anonymously..."
                value={reportText}
                onScroll={(e: any) => backdropRef.current && (backdropRef.current.scrollTop = e.target.scrollTop)}
                onChange={(e) => setReportText(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* EVIDENCE SECTION */}
        <section className="mb-10">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">EVIDENCE VAULT</p>
          <div className="flex flex-col md:flex-row gap-4">
            <label className="flex-1 cursor-pointer group h-24 border-2 border-dashed border-gray-900 rounded-3xl flex flex-col items-center justify-center bg-gray-950 hover:border-emerald-500/20 hover:bg-emerald-900/5 transition-all">
              <Upload size={20} className="text-gray-600 group-hover:text-emerald-500 mb-2 transition-colors" />
              <span className="text-[10px] font-bold text-gray-600 group-hover:text-emerald-400 uppercase transition-colors">Select File</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleEvidenceUpload} />
            </label>

            {evidenceFile && (
              <div className="flex-1 bg-gray-900/50 border border-gray-800 p-4 rounded-3xl flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-black border border-gray-800 shrink-0">
                  {fileType === 'image' && evidencePreview ? <img src={evidencePreview} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-2xl">🎥</div>}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-black text-emerald-500 truncate">{evidenceFile.name}</p>
                  {imageAnalysis && imageAnalysis[0] && <p className="text-[9px] text-blue-400 font-bold uppercase mt-1">CV: {(imageAnalysis[0] as any).label} ({(imageAnalysis[0].score * 100).toFixed(0)}%)</p>}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="space-y-4">
          <button
            onClick={finalizeSubmission}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-5 rounded-3xl font-black text-[12px] tracking-[0.2em] uppercase transition-all
                        ${canSubmit
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
                : 'bg-gray-900 text-gray-500 cursor-not-allowed'}
                    `}
          >
            {isSubmitting ? 'PROCESSING ZK PROOF & UPLOADING...' :
              !isOnline && canSubmit ? 'STORE IN OFFLINE VAULT' :
                isAnalyzing ? 'INTELLIGENCE PROCESSING...' :
                  systemBlocked ? 'SUBMISSION BLOCKED' :
                    hasPii ? `REMOVE ${Array.from(new Set(piiDetected.map(p => p.type))).join("/")} TO SUBMIT` :
                      !canSubmit ? 'COMPLETE NARRATIVE' :
                        'FINALIZE BROADCAST'}
          </button>
          <p className="text-[9px] text-center text-gray-700 font-bold uppercase tracking-widest">
            Zero-Knowledge Identity • IPFS Immutable Storage • Relayer Encrypted
          </p>
        </footer>
      </motion.div>
    </div>
  );
};