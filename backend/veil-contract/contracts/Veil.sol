// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@anon-aadhaar/contracts/interfaces/IAnonAadhaar.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Veil is Ownable {
    IAnonAadhaar public anonAadhaarVerifier;
    uint256 public immutable appId;
    
    // Map IPFS CID to Report Status (0=Pending, 1=Verified, 2=Flagged/Spam)
    mapping(string => uint8) public reportStatus;
    
    // Map User Commitment (Nullifier) to Reputation Score
    // Starts at 0 (neutral). Can go negative.
    mapping(uint256 => int256) public reputation;

    event NewReportSubmitted(uint256 indexed timestamp, string ipfsCid);
    event ReportStatusUpdated(string indexed ipfsCid, uint8 status);
    event ReputationChanged(uint256 indexed user, int256 newScore, int256 change);

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
        uint[4] memory revealArray; // Empty for local verifier check
        require(
            anonAadhaarVerifier.verifyAnonAadhaarProof(
                nullifierSeed,
                nullifier,
                block.timestamp, // Use block timestamp as proxy if not provided
                signal,
                revealArray,
                groth16Proof
            ),
            "Invalid Anon-Aadhaar Proof"
        );
        
        // Initialize status as Pending (0)
        reportStatus[ipfsCid] = 0;

        emit NewReportSubmitted(block.timestamp, ipfsCid);
    }

    // --- Admin Functions ---

    function updateReportStatus(string memory ipfsCid, uint8 status, uint256 userNullifier) public onlyOwner {
        require(status <= 3, "Invalid Status"); 
        // 0=Pending, 1=Verified, 2=Flagged, 3=Spam
        
        reportStatus[ipfsCid] = status;
        emit ReportStatusUpdated(ipfsCid, status);

        // Auto-update reputation based on status
        if (status == 1) { // Verified
            _modifyReputation(userNullifier, 10);
        } else if (status == 2) { // Flagged
            _modifyReputation(userNullifier, -10);
        } else if (status == 3) { // Spam
            _modifyReputation(userNullifier, -30);
        }
    }

    function _modifyReputation(uint256 user, int256 change) internal {
        reputation[user] += change;
        emit ReputationChanged(user, reputation[user], change);
    }
}