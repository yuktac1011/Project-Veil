const fs = require('fs');
const path = require('path');

const artifactPath = path.resolve(__dirname, '../veil-contract/artifacts/contracts/Veil.sol/Veil.json');
const destPath = path.resolve(__dirname, 'abi/Veil.json');

if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    fs.writeFileSync(destPath, JSON.stringify(artifact.abi, null, 2));
    console.log("ABI Synced Successfully!");
} else {
    console.error("Artifact not found at:", artifactPath);
}
