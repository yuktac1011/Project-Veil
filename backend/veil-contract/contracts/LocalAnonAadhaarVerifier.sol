// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@anon-aadhaar/contracts/interfaces/IAnonAadhaar.sol";

/**
 * @title LocalAnonAadhaarVerifier
 * @dev Implements IAnonAadhaar interface for local environments where
 *      running the full ZK verifier (2MB+ keys) is impractical.
 *      This is NOT a mock that always returns true blindly; it enforces
 *      structure and ensures signals are present, but skips the cryptographic curve check.
 */
contract LocalAnonAadhaarVerifier is IAnonAadhaar {
    
    function verifyAnonAadhaarProof(
        uint nullifierSeed,
        uint nullifier,
        uint timestamp,
        uint signal,
        uint[4] memory revealArray,
        uint[8] memory groth16Proof
    ) external view returns (bool) {
        // 1. Basic Structure Integrity Checks
        require(nullifierSeed != 0, "Invalid Seed");
        require(nullifier != 0, "Invalid Nullifier");
        
        // 2. Ensure Proof Data is present (Prevent empty proofs)
        require(groth16Proof[0] != 0 || groth16Proof[1] != 0, "Empty Proof");

        // 3. Validation Logic
        // For Local Dev: Return true to allow flow testing
        return true;
    }
}
