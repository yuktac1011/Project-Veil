const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy Mock Semaphore
  const MockSemaphore = await ethers.getContractFactory("MockSemaphore");
  const semaphore = await MockSemaphore.deploy();
  await semaphore.waitForDeployment();
  const semaphoreAddress = await semaphore.getAddress();
  console.log("Mock Semaphore deployed to:", semaphoreAddress);

  // 2. Setup Group (Mock call)
  const GROUP_ID = 42;
  // We try-catch this just in case, but MockSemaphore has the function stubbed so it should pass.
  try {
      await semaphore.createGroup(GROUP_ID, deployer.address);
      console.log(`Group ${GROUP_ID} created`);
  } catch (e) {
      console.log("Skipping group creation (Mock mode)");
  }

  // 3. Deploy Veil
  const Veil = await ethers.getContractFactory("Veil");
  const veil = await Veil.deploy(semaphoreAddress, GROUP_ID);
  await veil.waitForDeployment();
  const veilAddress = await veil.getAddress();

  console.log("------------------------------------------------");
  console.log("Veil Contract deployed to:", veilAddress);
  console.log("------------------------------------------------");

  // 4. Fund the Contract
  const tx = await deployer.sendTransaction({
    to: veilAddress,
    value: ethers.parseEther("1.0")
  });
  await tx.wait();
  console.log("Veil Treasury funded with 1.0 ETH");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});