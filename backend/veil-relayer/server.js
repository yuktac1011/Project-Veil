require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { ethers } = require("ethers");
const VeilABI = require("./abi/Veil.json");

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
  max: 5,
  message: {
    success: false,
    error: "Too many requests from this IP. Try again later.",
  },
});

// 4. API ENDPOINT
app.post("/api/submit-report", submissionLimiter, async (req, res) => {
  try {
    const { proofData, ipfsCid } = req.body;

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

    res.json({ success: true, txHash: tx.hash });
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