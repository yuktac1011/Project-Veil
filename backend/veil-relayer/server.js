require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ethers } = require("ethers");
const VeilABI = require("./abi/Veil.json");
const db = require("./database"); // Import Database

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE SETUP
app.use(helmet());
app.use(cors());
app.use(express.json());

// 2. BLOCKCHAIN SETUP
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
  windowMs: 60 * 60 * 1000,
  max: 20, // Increased for testing
  message: {
    success: false,
    error: "Too many requests from this IP. Try again later.",
  },
});

// 4. API ENDPOINTS

// ORGANIZATION LOGIN
app.post("/api/login-org", async (req, res) => {
    const { orgId, accessKey } = req.body;
    // Hardcoded for MVP
    if (orgId === 'ADMIN-01' && accessKey === 'veil-2025') {
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
        
        let score = 50; // Base Score
        stats.forEach(row => {
            if (row.status === 'verified') score += (row.count * 15);
            if (row.status === 'flagged') score -= (row.count * 10);
            if (row.status === 'spam') score -= (row.count * 30);
        });

        score = Math.max(0, Math.min(100, score)); // Clamp 0-100

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

// UPDATE STATUS
app.post("/api/update-status", async (req, res) => {
    try {
        const { reportId, status } = req.body;
        if (!['verified', 'flagged', 'spam', 'pending'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        await db.updateReportStatus(reportId, status);
        res.json({ success: true, status });
    } catch (error) {
        res.status(500).json({ success: false, error: "Update failed" });
    }
});

// GET REPORTS (Investigator Dashboard)
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

// SUBMIT REPORT
app.post("/api/submit-report", submissionLimiter, async (req, res) => {
  try {
    // metadata fields are now expected in the body for the database
    const { proofData, ipfsCid, title, category, severity, description, status } = req.body;

    // Validation
    if (!proofData || !ipfsCid) {
      return res.status(400).json({ error: "Missing Proof or CID" });
    }

    const { nullifierSeed, nullifier, signal, groth16Proof } = proofData;

    // Sanity check for array structure (Standard Groth16 is 8 points for Solidity)
    if (!Array.isArray(groth16Proof) || groth16Proof.length !== 8) {
         return res.status(400).json({ error: "Invalid Proof Format" });
    }

    console.log(`--> Submitting Aadhaar Proof for CID: ${ipfsCid}`);
    console.log(`--> Signal in Proof: ${signal}`);
    console.log(`--> Relayer Wallet: ${relayerWallet.address}`);

    // 5. EXECUTE TRANSACTION
    // The Smart Contract call
    const tx = await veilContract.submitReport(
      nullifierSeed,
      nullifier,
      signal,
      groth16Proof,
      ipfsCid,
      { value: ethers.parseEther("0.001") } // Gas/Stake
    );

    console.log(`--> Transaction Sent! Hash: ${tx.hash}`);

    await tx.wait(1);

    console.log(`--> Transaction Confirmed`);

    // 6. SAVE TO DATABASE
    const reportId = `rep_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const reportData = {
        id: reportId,
        ipfsCid,
        title: title || "Untitled Report",
        category: category || "Uncategorized",
        severity: severity || "medium",
        description: description || "No description provided.",
        status: status || "pending",
        timestamp: Date.now(),
        txHash: tx.hash,
        userCommitment: nullifier ? nullifier.toString() : "0x0" // Approximate user identity
    };
    
    await db.insertReport(reportData);
    console.log(`--> Saved to SQLite DB: ${reportId}`);

    res.json({ success: true, txHash: tx.hash, reportId });
  } catch (error) {
    console.error("Relay Error:", error);
    
    let msg = error.message;
    if(error.reason) msg = `Revert: ${error.reason}`;
    
    res.status(500).json({ success: false, error: msg });
  }
});

// Health Check
app.get("/", (req, res) => {
  res.send("Project VEIL Relayer is Running. Privacy enabled.");
});

// START SERVER
app.listen(PORT, () => {
  console.log(`\n=== PROJECT VEIL RELAYER ===`);
  console.log(`Status: Online`);
  console.log(`Port: ${PORT}`);
  console.log(`RPC: ${process.env.RPC_URL}`);
  console.log(`============================\n`);
});