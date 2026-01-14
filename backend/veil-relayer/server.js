require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ethers } = require('ethers');
const VeilABI = require('./abi/Veil.json');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. MIDDLEWARE SETUP
app.use(helmet()); // Security headers
app.use(cors()); // Allow Frontend to hit this API
app.use(express.json()); // Parse JSON bodies

// 2. BLOCKCHAIN SETUP
// Connect to the provider (Localhost or Testnet)
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

// Create a Wallet instance using the Relayer's Private Key
const relayerWallet = new ethers.Wallet(process.env.RELAYER_PRIVATE_KEY, provider);

// Connect to the deployed Smart Contract
const veilContract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    VeilABI,
    relayerWallet // Connects the wallet so we can write/sign transactions
);

// 3. RATE LIMITER (The Anti-Spam "Moat")
// Limit IP to 5 requests per hour to protect Relayer funds
const submissionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, 
    message: { success: false, error: "Too many requests from this IP. Try again later." }
});

// 4. API ENDPOINT
app.post('/api/submit-report', submissionLimiter, async (req, res) => {
    try {
        console.log("--> Receiving Report Submission...");

        const { 
            merkleTreeRoot, 
            nullifierHash, 
            externalNullifier, 
            proof, 
            ipfsCid 
        } = req.body;

        // Basic Validation
        if (!ipfsCid || !proof || proof.length !== 8) {
            return res.status(400).json({ success: false, error: "Invalid Data Format" });
        }

        console.log(`--> Processing CID: ${ipfsCid}`);
        console.log(`--> Relayer Wallet: ${relayerWallet.address}`);

        // 5. EXECUTE TRANSACTION
        // We attach 0.01 ETH as the 'Stake' (Value)
        const stakeAmount = ethers.parseEther("0.01");

        const tx = await veilContract.submitReport(
            merkleTreeRoot,
            nullifierHash,
            externalNullifier,
            proof,
            ipfsCid,
            { value: stakeAmount } // THIS IS THE PENALTY STAKE
        );

        console.log(`--> Transaction Sent! Hash: ${tx.hash}`);

        // Wait for 1 confirmation
        const receipt = await tx.wait(1);

        console.log(`--> Transaction Confirmed in Block: ${receipt.blockNumber}`);

        // 6. RETURN SUCCESS
        res.status(200).json({
            success: true,
            message: "Report successfully submitted to blockchain.",
            transactionHash: tx.hash,
            blockNumber: receipt.blockNumber
        });

    } catch (error) {
        console.error("--> Submission Failed:", error);

        // Handle specific Blockchain errors (e.g., execution reverted)
        let errorMessage = "Internal Server Error";
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = "Relayer Wallet out of funds";
        } else if (error.reason) {
            errorMessage = `Blockchain Revert: ${error.reason}`;
        }

        res.status(500).json({
            success: false,
            error: errorMessage
        });
    }
});

// Health Check
app.get('/', (req, res) => {
    res.send('Project VEIL Relayer is Running. Privacy enabled.');
});

// START SERVER
app.listen(PORT, () => {
    console.log(`\n=== PROJECT VEIL RELAYER ===`);
    console.log(`Status: Online`);
    console.log(`Port: ${PORT}`);
    console.log(`RPC: ${process.env.RPC_URL}`);
    console.log(`============================\n`);
});

