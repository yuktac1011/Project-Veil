// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@anon-aadhaar/contracts/interfaces/IAnonAadhaar.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Veil is Ownable {
    IAnonAadhaar public anonAadhaarVerifier;
    uint256 public immutable appId;
    
    // To prevent double reporting for the same signal (IPFS CID)
    mapping(uint256 => bool) public nullifiers; 

    event NewReportSubmitted(uint256 indexed timestamp, string ipfsCid);

    constructor(address _verifierAddress, uint256 _appId) Ownable(msg.sender) {
        anonAadhaarVerifier = IAnonAadhaar(_verifierAddress);
        appId = _appId;
    }

    function submitReport(
        uint256 nullifierSeed,
        uint256 nullifier,
        uint256 signal,
        uint256[8] memory groth16Proof,
        string memory ipfsCid
    ) public payable {
        // 1. Verify the Proof
        require(
            anonAadhaarVerifier.verifyProof(
                nullifierSeed,
                nullifier,
                signal,
                signal, // In this context, signal is used twice in standard SDK implementation often, or 0 if unused external
                groth16Proof
            ),
            "Invalid Anon-Aadhaar Proof"
        );

        // 2. Prevent Double Spending (Optional: Limit 1 report per person? Or allow many?)
        // If you want 1 report per person per AppID:
        // require(!nullifiers[nullifier], "Identity already used");
        // nullifiers[nullifier] = true;

        emit NewReportSubmitted(block.timestamp, ipfsCid);
    }
}