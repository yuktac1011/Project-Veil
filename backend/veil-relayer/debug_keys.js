const { ethers } = require("ethers");

async function check() {
    const pk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(pk);
    console.log("Wallet Address:", wallet.address);
    const pubKey = wallet.signingKey.publicKey;
    console.log("Wallet Public Key:", pubKey);
    console.log("Wallet Public Key Length:", pubKey.length);

    const brokenKey = "0406738e36ff52a16c5c6f196ab64fb99da869f37285badbfc096caaa7e9663593e234379cc985de2665c485e88f1ea775ff0658ee8b900ca9";
    
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
