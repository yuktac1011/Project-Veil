const { ethers } = require("ethers");
const pk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(pk);
console.log(wallet.signingKey.publicKey.replace("0x", ""));
