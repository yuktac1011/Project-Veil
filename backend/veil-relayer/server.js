require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ethers } = require("ethers");
const EthCrypto = require("eth-crypto");
const VeilABI = require("./abi/Veil.json");
const db = require("./database");
const aiService = require("./ai_service");

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE SETUP
app.use(helmet());
app.use(cors());
app.use(express.json());

// 2. BLOCKCHAIN SETUP
// Note: Backend listens to events or just provides API.
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const relayerWallet = new ethers.Wallet(
  process.env.RELAYER_PRIVATE_KEY,
  provider
);
const veilContract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  VeilABI,
  relayerWallet
);

// 3. RATE LIMITER
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, error: "Too many requests. Try again later." },
});

// 4. API ENDPOINTS

// GET AUTHORITY PUBLIC KEY (For Client-Side Encryption)
app.get("/api/authority-public-key", (req, res) => {
  try {
    const publicKey = relayerWallet.signingKey.publicKey; // Compressed or Uncompressed? EthCrypto expects Uncompressed usually, or specific format.
    // EthCrypto uses '04' prefix uncompressed usually.
    // ethers public key usually includes 0x04.
    res.json({ success: true, publicKey });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to get public key" });
  }
});

// --- AI VALIDATION ENDPOINT ---
app.post("/api/ai/validate", submissionLimiter, async (req, res) => {
  try {
    const { text, imageHash } = req.body;

    console.log("AI Validation Request:", { textLength: text?.length, imageHash });

    const result = await aiService.validateContent(text, imageHash);

    console.log("AI Result:", result);

    // Do NOT store the text here. In-memory processing only.

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("AI Validation Error:", error);
    res.status(500).json({ success: false, error: "AI Validation Failed" });
  }
});

// ORGANIZATION LOGIN (Kept for Admin)
app.post("/api/login-org", async (req, res) => {
  const { orgId, accessKey } = req.body;
  if (orgId === process.env.ADMIN_ORG_ID && accessKey === process.env.ADMIN_ACCESS_KEY) {
    console.log("Admin Login Successful");
    return res.json({
      success: true,
      data: { token: 'mock_jwt_admin_token', name: 'Global Oversight Agency' }
    });
  }
  return res.status(401).json({ success: false, error: 'Invalid Credentials' });
});

// GET REPUTATION
app.get("/api/reputation/:commitment", async (req, res) => {
  try {
    const { commitment } = req.params;
    const stats = await db.getReputationStats(commitment);

    let score = 50;
    stats.forEach(row => {
      if (row.status === 'verified') score += (row.count * 15);
      if (row.status === 'flagged') score -= (row.count * 10);
      if (row.status === 'spam') score -= (row.count * 30);
    });

    score = Math.max(0, Math.min(100, score));
    let level = 'Novice';
    if (score >= 90) level = 'Elite';
    else if (score >= 70) level = 'Trusted';
    else if (score < 30) level = 'Suspicious';

    res.json({ success: true, data: { commitment, score, level } });
  } catch (error) {
    console.error("Reputation Error:", error);
    res.status(500).json({ success: false, error: "Failed to calc reputation" });
  }
});

// GET REPORT STATUS
app.get("/api/report/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const report = await db.getReport(id);
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, data: { status: report.status, ipfsCid: report.ipfsCid } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

// UPDATE REPORT STATUS (Admin Only)
app.post("/api/update-status", async (req, res) => {
  try {
    const { reportId, status } = req.body;
    if (!reportId || !status) return res.status(400).json({ error: "Missing parameters" });

    // Validate status
    const validStatuses = ['pending', 'verified', 'flagged', 'spam'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });

    await db.updateReportStatus(reportId, status);
    console.log(`Report ${reportId} status updated to ${status}`);

    res.json({ success: true });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, error: "Update failed" });
  }
});

// SYNC SUBMISSION (Called by Frontend after Blockchain TX)
// Stores metadata only. No content.
app.post("/api/sync-report", async (req, res) => {
  try {
    const { ipfsCid, txHash, category, nullifier, title, description } = req.body;

    if (!ipfsCid || !txHash) return res.status(400).json({ error: "Missing Data" });

    // Verify TX on chain (Optional but good)
    // const tx = await provider.getTransaction(txHash);
    // if (!tx) throw new Error("Transaction not found");

    const reportId = `rep_${Date.now()}`;

    // Admin Dashboard fetches content from DB.
    // In a real encrypted system, Admin would decrypt IPFS content.
    // For MVP, we entrust the Relayer with the content.
    const reportData = {
      id: reportId,
      ipfsCid,
      title: title || "Encrypted Report",
      category: category || "Uncategorized",
      severity: "medium",
      description: description || "Content is encrypted on IPFS.",
      status: "pending",
      timestamp: Date.now(),
      txHash: txHash,
      userCommitment: nullifier || "0x0"
    };

    await db.insertReport(reportData);
    console.log(`--> Synced Report Metadata: ${reportId}`);

    res.json({ success: true, reportId });

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({ success: false, error: "Sync failed" });
  }
});

// GET REPORTS
app.get("/api/reports", async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category
    };
    const reports = await db.getReports(filters);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch reports" });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.send("Project VEIL Backend (Sepolia Mode) is Running.");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`\n=== PROJECT VEIL BACKEND ===`);
  console.log(`Status: Online`);
  console.log(`Port: ${PORT}`);
  console.log(`RPC Connected`);
  console.log(`============================\n`);
});