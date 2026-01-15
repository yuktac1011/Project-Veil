const EthCrypto = require('eth-crypto');
const pk = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const publicKey = EthCrypto.publicKeyByPrivateKey(pk);
const fs = require('fs');
fs.writeFileSync('key.txt', publicKey);
console.log("Key written to key.txt");
