const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function main() {
    console.log("Starting Manual Deployment...");

    // 1. Setup Provider & Wallet
    // Use Hardhat Node URL
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    // Account #0 from Hardhat node usually
    const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

    console.log("Deploying with account:", wallet.address);

    // 2. Load Artifacts
    const verifierArtifactPath = path.resolve(__dirname, "../veil-contract/artifacts/contracts/LocalAnonAadhaarVerifier.sol/LocalAnonAadhaarVerifier.json");
    const veilArtifactPath = path.resolve(__dirname, "../veil-contract/artifacts/contracts/Veil.sol/Veil.json");

    if (!fs.existsSync(verifierArtifactPath) || !fs.existsSync(veilArtifactPath)) {
        throw new Error("Artifacts not found! Make sure 'npx hardhat compile' ran successfully at least once.");
    }

    const verifierArtifact = JSON.parse(fs.readFileSync(verifierArtifactPath));
    const veilArtifact = JSON.parse(fs.readFileSync(veilArtifactPath));

    // 3. Deploy Verifier
    console.log("Deploying LocalVerifier...");
    const VerifierFactory = new ethers.ContractFactory(verifierArtifact.abi, verifierArtifact.bytecode, wallet);
    const verifier = await VerifierFactory.deploy();
    await verifier.waitForDeployment();
    const verifierAddress = await verifier.getAddress();
    console.log(`LocalVerifier deployed to: ${verifierAddress}`);

    // 4. Deploy Veil
    console.log("Deploying Veil...");
    const APP_ID = BigInt("123456789");
    const VeilFactory = new ethers.ContractFactory(veilArtifact.abi, veilArtifact.bytecode, wallet);
    const veil = await VeilFactory.deploy(verifierAddress, APP_ID);
    await veil.waitForDeployment();
    const veilAddress = await veil.getAddress();
    console.log(`Veil deployed to: ${veilAddress}`);

    // 5. Fund Veil Treasury
    console.log("Funding Veil Treasury...");
    const tx = await wallet.sendTransaction({
        to: veilAddress,
        value: ethers.parseEther("1.0")
    });
    await tx.wait();
    console.log("Funded.");

    // 6. Update Backend Config
    console.log("Updating Backend Config...");

    // Save ABI
    const abiDir = path.join(__dirname, "abi");
    if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir);
    fs.writeFileSync(path.join(abiDir, "Veil.json"), JSON.stringify(veilArtifact.abi, null, 2));
    console.log("Veil ABI saved.");

    // Update .env
    const envPath = path.join(__dirname, ".env");
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(/CONTRACT_ADDRESS=".*"/, `CONTRACT_ADDRESS="${veilAddress}"`);
    fs.writeFileSync(envPath, envContent);
    console.log("Updated .env CONTRACT_ADDRESS.");

    console.log("Deployment Complete!");
    process.exit(0);
}

main().catch(error => {
    console.error("Deployment Failed:", error);
    process.exit(1);
});
