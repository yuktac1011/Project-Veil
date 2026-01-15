const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Local Verifier
  const LocalVerifier = await ethers.getContractFactory("LocalAnonAadhaarVerifier");
  const verifier = await LocalVerifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("Local Identity Verifier deployed to:", verifierAddress);

  // 2. Deploy Veil
  // App ID can be anything for local; usually the last part of your appId string from Dev Portal
  const APP_ID = BigInt("123456789"); 
  const Veil = await ethers.getContractFactory("Veil");
  const veil = await Veil.deploy(verifierAddress, APP_ID);
  await veil.waitForDeployment();
  const veilAddress = await veil.getAddress();

  console.log("------------------------------------------------");
  console.log("Veil Contract deployed to:", veilAddress);
  console.log("------------------------------------------------");

  // 3. Fund the Contract
  const tx = await deployer.sendTransaction({
    to: veilAddress,
    value: ethers.parseEther("1.0")
  });
  await tx.wait();
  console.log("Veil Treasury funded with 1.0 ETH");

  // 4. Save ABI and Address for Backend
  const fs = require("fs");
  const path = require("path");
  
  const abiDir = path.join(__dirname, "../../veil-relayer/abi");
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir);

  const artifact = artifacts.readArtifactSync("Veil");
  fs.writeFileSync(
    path.join(abiDir, "Veil.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("Veil ABI saved to backend/veil-relayer/abi/Veil.json");

  // Update .env in veil-relayer
  const envPath = path.join(__dirname, "../../veil-relayer/.env");
  let envContent = fs.readFileSync(envPath, "utf8");
  envContent = envContent.replace(
    /CONTRACT_ADDRESS=".*"/, 
    `CONTRACT_ADDRESS="${veilAddress}"`
  );
  fs.writeFileSync(envPath, envContent);
  console.log("Updated CONTRACT_ADDRESS in backend/veil-relayer/.env");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});