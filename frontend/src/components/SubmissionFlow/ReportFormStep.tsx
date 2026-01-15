import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Upload, AlertTriangle, CheckCircle, FileText, Lock } from 'lucide-react';
import EthCrypto from 'eth-crypto';
import { ethers } from 'ethers';
import axios from 'axios';
import VeilABI from '../../abi/Veil.json';
import { useReportStore } from '../../store/useReportStore';

interface Props {
    proofData: any;
    walletAddress: string | null;
    onSuccess: (reportId: string) => void;
}

export const ReportFormStep: React.FC<Props> = ({ proofData, walletAddress, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('0'); // 0=Crime, 1=Corruption
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<{ decision: string, score: number, issues: string[] } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string>('');

    const [files, setFiles] = useState<FileList | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const CONTRACT_ADDRESS = import.meta.env.VITE_VEIL_CONTRACT_ADDRESS || "0x03F105f8E55F7262adD78ade3f6c16c953D15B50";

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(e.target.files);
        }
    };

    const handleAnalyze = async () => {
        if (!description) return;
        setIsAnalyzing(true);
        setAiResult(null);
        try {
            const res = await axios.post(`${API_URL}/ai/validate`, { text: description });
            setAiResult(res.data);
            if (res.data.decision === 'REJECT') {
                setStatus("AI rejected the content.");
            } else {
                setStatus("Content approved by AI.");
            }
        } catch (e) {
            console.error(e);
            setStatus("AI Analysis Failed.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async () => {
        if (!aiResult || aiResult.decision !== 'ALLOW') return;

        if (!CONTRACT_ADDRESS) {
            setStatus("Configuration Error: Contract Address Missing");
            console.error("VITE_VEIL_CONTRACT_ADDRESS is missing");
            return;
        }

        setIsSubmitting(true);
        setStatus("Fetching Authority Key...");

        try {
            // 1. Get Authority Key
            const keyRes = await axios.get(`${API_URL}/authority-public-key`);
            const authorityKey = keyRes.data.publicKey;

            // 2. Encrypt
            setStatus("Encrypting Report...");
            const payload = {
                title,
                description,
                category,
                timestamp: Date.now(),
                authorPublicKey: walletAddress,
                aiAnalysis: aiResult,
                hasFiles: !!files
            };

            const cleanKey = authorityKey.startsWith('0x') ? authorityKey.slice(2) : authorityKey;

            const encryptedStruct = await EthCrypto.encryptWithPublicKey(cleanKey, JSON.stringify(payload));
            const encryptedString = EthCrypto.cipher.stringify(encryptedStruct);

            // 3. Upload to IPFS via Pinata
            setStatus("Uploading to IPFS...");
            const pinataJWT = import.meta.env.VITE_PINATA_JWT;

            // Upload JSON
            const ipfsRes = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS",
                {
                    pinataContent: { content: encryptedString },
                    pinataMetadata: { name: `VEIL_ENC_${Date.now()}` }
                },
                {
                    headers: { 'Authorization': `Bearer ${pinataJWT}` }
                }
            );

            const ipfsCid = ipfsRes.data.IpfsHash;
            setStatus(`Uploaded: ${ipfsCid}. Confirming Transaction...`);

            // 4. Submit to Blockchain
            if (!(window as any).ethereum) throw new Error("No Wallet");
            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, VeilABI, signer);

            // Prepare Proof Args
            const pcdStr = proofData.pcd;
            const pcd = JSON.parse(pcdStr);
            console.log("PCD Parsed:", pcd);

            // Fix: Anon Aadhaar v2 nests the actual proof inside groth16Proof
            const proof = pcd.proof.groth16Proof || pcd.proof;

            // Extract Signals with fallback
            const nullifierSeed = pcd.claim?.nullifierSeed || "123456789";
            const nullifier = pcd.claim?.nullifier || "123456789";
            const signal = pcd.claim?.signal || "1";

            // Format Proof for Solidity (pairing library usually expects reversed B pairs)
            const groth16Proof = [
                proof.pi_a[0], proof.pi_a[1],
                proof.pi_b[0][1], proof.pi_b[0][0],
                proof.pi_b[1][1], proof.pi_b[1][0],
                proof.pi_c[0], proof.pi_c[1]
            ];

            const tx = await contract.submitReport(
                nullifierSeed,
                nullifier,
                signal,
                groth16Proof,
                ipfsCid,
                category,
                { value: ethers.parseEther("0.001") }
            );

            setStatus(`Transaction Sent: ${tx.hash.slice(0, 10)}... Waiting for confirmation...`);
            await tx.wait();

            // 5. Sync Metadata
            // For MVP: We send title/description to backend so Admin can view it.
            // (In prod, Admin would fetch IPFS and decrypt locally).
            await axios.post(`${API_URL}/sync-report`, {
                ipfsCid,
                txHash: tx.hash,
                category,
                nullifier,
                title,
                description
            });

            // 6. Update Local Store (Instant Feedback)
            const { addReport, addActivity } = useReportStore.getState();

            addReport({
                id: ipfsCid, // Use CID as ID for now
                title: title || "Untitled Report",
                status: 'pending', // Blockchain status pending verification
                date: new Date().toLocaleDateString(),
                cid: ipfsCid,
                category: category === '0' ? 'Crime' : category === '1' ? 'Corruption' : 'Hazard',
                severity: 'medium',
                txHash: tx.hash
            });

            addActivity({
                type: 'submission',
                message: `Submitted: ${title || "Report"}`,
                status: 'success',
                hash: tx.hash.slice(0, 8)
            });

            onSuccess(ipfsCid);

        } catch (e: any) {
            console.error(e);
            setStatus(`Failed: ${e.message || e.toString()}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold">Report Details</h2>

            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Report Title"
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Describe the incident in detail..."
                    className="w-full h-32 bg-zinc-900 border border-zinc-800 p-4 rounded-xl"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <select
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="0">Crime</option>
                    <option value="1">Corruption</option>
                    <option value="2">Safety Hazard</option>
                </select>

                {/* File Upload */}
                <div
                    onClick={handleFileClick}
                    className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center text-zinc-500 cursor-pointer hover:border-zinc-700 transition-colors"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                    />
                    <Upload className="mx-auto mb-2" />
                    <p>{files ? `${files.length} file(s) selected` : "Click to upload proof (Images/Video)"}</p>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold flex items-center gap-2">
                        <Lock size={16} /> Privacy & AI Check
                    </span>
                </div>

                {!aiResult ? (
                    <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !description}
                        variant="ghost"
                        className="w-full border border-zinc-700"
                    >
                        {isAnalyzing ? "Analyzing..." : "Check Content with AI"}
                    </Button>
                ) : (
                    <div className={aiResult.decision === 'ALLOW' ? "text-emerald-500" : "text-red-500"}>
                        <div className="flex items-center gap-2 font-bold mb-2">
                            {aiResult.decision === 'ALLOW' ? <CheckCircle /> : <AlertTriangle />}
                            {aiResult.decision}
                        </div>
                        <ul className="text-sm list-disc list-inside text-zinc-400">
                            <li>Quality Score: {aiResult.score}</li>
                            {aiResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                        </ul>
                    </div>
                )}
            </div>

            {/* Submit Button */}
            {aiResult?.decision === 'ALLOW' && (
                <Button
                    onClick={handleSubmit}
                    className="w-full py-4 text-lg bg-emerald-600 hover:bg-emerald-700"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? status : "Encrypt & Submit Report (0.001 ETH)"}
                </Button>
            )}

            {status && <div className="text-center text-sm text-zinc-500">{status}</div>}
        </motion.div>
    );
};
