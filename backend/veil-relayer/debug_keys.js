const { ethers } = require("ethers");

async function check() {
    const pk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(pk);
    console.log("Wallet Address:", wallet.address);
    const pubKey = wallet.signingKey.publicKey;
    console.log("Wallet Public Key:", pubKey);
    console.log("Wallet Public Key Length:", pubKey.length);

    const brokenKey = "048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5";
    
    // Check if brokenKey is a substring
    if (pubKey.includes(brokenKey)) {
        console.log("MATCH FOUND! The broken key is a substring.");
    } else if (pubKey.includes(brokenKey.substring(2))) {
       console.log("MATCH FOUND (ignoring prefix)!");
    } else {
        // Check partial match
        // brokenKey starts with 04, then 0673...
        // pubKey starts with 04, then ...
        console.log("Comparing:");
        console.log("Real:   " + pubKey);
        console.log("Broken: " + brokenKey);
    }
}

check();
