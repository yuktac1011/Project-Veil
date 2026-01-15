require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ethers } = require("ethers");
const EthCrypto = require("eth-crypto");
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
// UPDATE STATUS
app.get("/api/report/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const report = await db.getReport(id);
    if (!report) return res.status(404).json({ error: "Not found" });
    // Wrap in 'data' to match ApiResponse interface on frontend
    res.json({ success: true, data: { status: report.status, ipfsCid: report.ipfsCid } });
  } catch (error) {
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

// UPDATE STATUS (POST)
app.post("/api/update-status", async (req, res) => {
  try {
    const { reportId, status } = req.body;
    const validStatuses = { 'pending': 0, 'verified': 1, 'flagged': 2, 'spam': 3 };

    if (!Object.keys(validStatuses).includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // 1. Get Report Details (Need CID and Nullifier)
    const report = await db.getReport(reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });

    const statusInt = validStatuses[status];
    const userNullifier = report.userCommitment !== "0x0" ? report.userCommitment : "0";

    console.log(`--> Updating Status On-Chain: ${report.ipfsCid} -> ${status} (${statusInt})`);

    // 2. Call Smart Contract
    // Only if it's a real user (has nullifier) and not "pending" (0)
    // If "pending", we might just update DB, or maybe we don't allow reverting to pending on-chain typically.
    if (statusInt > 0) {
      try {
        const tx = await veilContract.updateReportStatus(
          report.ipfsCid,
          statusInt,
          userNullifier
        );
        console.log(`--> Tx Sent: ${tx.hash}`);
        await tx.wait(1);
        console.log(`--> Tx Confirmed`);
      } catch (contractError) {
        console.error("Contract Update Failed:", contractError.reason || contractError.message);
        // We might choose to fail here or continue to update local DB
        // return res.status(500).json({ error: "On-chain update failed" });
      }
    }

    // 3. Update Local DB
    await db.updateReportStatus(reportId, status);
    res.json({ success: true, status });
  } catch (error) {
    console.error("Update Status Error:", error);
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
    const { proofData, ipfsCid } = req.body;

    if (!proofData || !ipfsCid) {
      return res.status(400).json({ error: "Missing Proof or CID" });
    }

    const { nullifierSeed, nullifier, signal, groth16Proof } = proofData;

    if (!Array.isArray(groth16Proof) || groth16Proof.length !== 8) {
      return res.status(400).json({ error: "Invalid Proof Format" });
    }

    console.log(`--> Submitting Aadhaar Proof for CID: ${ipfsCid}`);
    console.log(`--> Signal in Proof: ${signal}`);
    console.log(`--> Fetching content from IPFS...`);

    const gateways = [
      `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
      `https://ipfs.io/ipfs/${ipfsCid}`,
      `https://cloudflare-ipfs.com/ipfs/${ipfsCid}`,
      `https://dweb.link/ipfs/${ipfsCid}`
    ];

    let encryptedString = null;
    let fetchError = null;

    for (const url of gateways) {
      try {
        console.log(`Trying gateway: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const ipfsRawData = await response.text();
        console.log(`--> Raw IPFS Data Length: ${ipfsRawData.length}`);

        try {
          const jsonBody = JSON.parse(ipfsRawData);
          encryptedString = jsonBody.content || ipfsRawData;
        } catch {
          encryptedString = ipfsRawData;
        }

        encryptedString = encryptedString.trim();
        console.log(`--> Encrypted Cipher: ${encryptedString.slice(0, 30)}...`);

        break; // success
      } catch (err) {
        fetchError = err;
        console.warn(`Gateway failed: ${url}`);
      }
    }

    if (!encryptedString) {
      throw new Error(`IPFS fetch failed: ${fetchError?.message}`);
    }

    console.log(`--> Content Fetched. Decrypting...`);

    const encryptedObject = EthCrypto.cipher.parse(encryptedString);
    const decryptedJSON = await EthCrypto.decryptWithPrivateKey(
      relayerWallet.privateKey,
      encryptedObject
    );

    const decryptedPayload = JSON.parse(decryptedJSON);
    const {
      title,
      category,
      severity,
      description,
      status,
      timestamp,
      authorPublicKey,
      aiAnalysis
    } = decryptedPayload;

    console.log(`--> Decrypted Report: "${title}" by ${authorPublicKey.slice(0, 10)}...`);

    const tx = await veilContract.submitReport(
      nullifierSeed,
      nullifier,
      signal,
      groth16Proof,
      ipfsCid,
      { value: ethers.parseEther("0.001") }
    );

    console.log(`--> Transaction Sent! Hash: ${tx.hash}`);
    await tx.wait(1);
    console.log(`--> Transaction Confirmed`);

    const reportId = `rep_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let finalStatus = status || "pending";
    if (aiAnalysis?.isSpam) finalStatus = "spam";

    const reportData = {
      id: reportId,
      ipfsCid,
      title: title || "Untitled Report",
      category: category || "Uncategorized",
      severity: severity || "medium",
      description: description || "No description provided.",
      status: finalStatus,
      timestamp: timestamp || Date.now(),
      txHash: tx.hash,
      userCommitment: nullifier ? nullifier.toString() : "0x0"
    };

    await db.insertReport(reportData);
    console.log(`--> Saved to SQLite DB: ${reportId}`);

    res.json({ success: true, txHash: tx.hash, reportId });
  } catch (error) {
    console.error("Relay Error:", error);

    const msg = error.reason ? `Revert: ${error.reason}` : error.message;
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