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

  console.log("Waiting 10s before next deployment...");
  await new Promise(resolve => setTimeout(resolve, 10000));

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

  // 3. Fund the Contract (SKIPPED FOR SEPOLIA to save gas)
  // const tx = await deployer.sendTransaction({
  //   to: veilAddress,
  //   value: ethers.parseEther("0.01") 
  // });
  // await tx.wait();
  // console.log("Veil Treasury funded (Skipped)");

  // 4. Save ABI and Address for Backend
  const fs = require("fs").promises;
  const path = require("path");

  const abiDir = path.join(__dirname, "../../veil-relayer/abi");

  try {
    await fs.access(abiDir);
  } catch {
    await fs.mkdir(abiDir, { recursive: true });
  }

  const artifact = artifacts.readArtifactSync("Veil"); // Hardhat artifact reading is synchronous usually, can keep or check if async exists. artifacts.readArtifact is async.
  // Using artifacts.readArtifact is better if available, but readArtifactSync is fine if it doesn't cause the handle issue. 
  // The issue likely comes from fs.write.

  await fs.writeFile(
    path.join(abiDir, "Veil.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("Veil ABI saved to backend/veil-relayer/abi/Veil.json");

  // wait to ensure handle release
  await new Promise(resolve => setTimeout(resolve, 500));

  // 5. Update .env in veil-relayer
  const envPathBackend = path.join(__dirname, "../../veil-relayer/.env");
  try {
    await fs.access(envPathBackend);
    let envContent = await fs.readFile(envPathBackend, "utf8");
    const regex = /CONTRACT_ADDRESS=".*"/;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `CONTRACT_ADDRESS="${veilAddress}"`);
    } else {
      envContent += `\nCONTRACT_ADDRESS="${veilAddress}"`;
    }
    await fs.writeFile(envPathBackend, envContent);
    console.log("Updated CONTRACT_ADDRESS in backend/veil-relayer/.env");
  } catch (err) {
    if (err.code !== 'ENOENT') console.error("Error updating backend .env:", err);
  }

  // wait to ensure handle release
  await new Promise(resolve => setTimeout(resolve, 500));

  // 6. Update .env in frontend
  const envPathFrontend = path.join(__dirname, "../../../frontend/.env");
  try {
    await fs.access(envPathFrontend);
    let envContent = await fs.readFile(envPathFrontend, "utf8");
    const regex = /VITE_VEIL_CONTRACT_ADDRESS=.*$/m;
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `VITE_VEIL_CONTRACT_ADDRESS=${veilAddress}`);
    } else {
      envContent += `\nVITE_VEIL_CONTRACT_ADDRESS=${veilAddress}`;
    }
    await fs.writeFile(envPathFrontend, envContent);
    console.log("Updated VITE_VEIL_CONTRACT_ADDRESS in frontend/.env");
  } catch (err) {
    if (err.code !== 'ENOENT') console.error("Error updating frontend .env:", err);
  }

  // Final wait before exit
  await new Promise(resolve => setTimeout(resolve, 1000));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});