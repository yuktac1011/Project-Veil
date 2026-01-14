// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Veil is Ownable {
    // We define this as the Interface, but our Mock satisfies the specific call we make.
    ISemaphore public semaphore;
    uint256 public groupId;
    
    // CONFIGURATION
    uint256 public constant STAKE_AMOUNT = 0.01 ether; 
    uint256 public constant REWARD_AMOUNT = 0.05 ether; 

    struct Report {
        uint256 id;
        string ipfsCid;
        address relayer; 
        bool isProcessed; 
    }

    mapping(uint256 => Report) public reports;
    uint256 public reportCounter;

    event NewReportSubmitted(uint256 indexed reportId, string ipfsCid, address indexed relayer);
    event ReportVerified(uint256 indexed reportId, address indexed reporterPayout);
    event ReportRejected(uint256 indexed reportId, address indexed relayerSlashed);

    constructor(address _semaphoreAddress, uint256 _groupId) Ownable(msg.sender) {
        semaphore = ISemaphore(_semaphoreAddress);
        groupId = _groupId;
    }

    /**
     * @dev Submits a report. Requires 0.01 ETH stake.
     * Compatible with Semaphore V4 inputs.
     */
    function submitReport(
        uint256 _merkleTreeDepth,
        uint256 _merkleTreeRoot,
        uint256 _nullifier,
        uint256 _scope, // Formerly 'externalNullifier'
        uint256[8] calldata _points,
        string calldata _ipfsCid
    ) external payable {
        // 1. Economic Check
        require(msg.value == STAKE_AMOUNT, "Relayer must stake exactly 0.01 ETH");

        // 2. Prepare the V4 Struct
        // Signal (message) is the Hash of the IPFS CID
        uint256 message = uint256(keccak256(abi.encodePacked(_ipfsCid)));

        ISemaphore.SemaphoreProof memory proofStruct = ISemaphore.SemaphoreProof({
            merkleTreeDepth: _merkleTreeDepth,
            merkleTreeRoot: _merkleTreeRoot,
            nullifier: _nullifier,
            message: message,
            scope: _scope,
            points: _points
        });

        // 3. ZK Verification
        // Calls the Mock (or Real) Semaphore contract
        semaphore.verifyProof(groupId, proofStruct);

        // 4. Store Data
        reports[reportCounter] = Report({
            id: reportCounter,
            ipfsCid: _ipfsCid,
            relayer: msg.sender,
            isProcessed: false
        });

        emit NewReportSubmitted(reportCounter, _ipfsCid, msg.sender);
        reportCounter++;
    }

    function processVerdict(uint256 _reportId, bool _isValid, address payable _payoutAddress) external onlyOwner {
        Report storage report = reports[_reportId];
        require(!report.isProcessed, "Report already processed");

        report.isProcessed = true;

        if (_isValid) {
            // Valid: Return Stake & Pay Reward
            payable(report.relayer).transfer(STAKE_AMOUNT);
            if (address(this).balance >= REWARD_AMOUNT) {
                _payoutAddress.transfer(REWARD_AMOUNT);
            }
            emit ReportVerified(_reportId, _payoutAddress);
        } else {
            // Invalid: Burn Stake
            payable(address(0x000000000000000000000000000000000000dEaD)).transfer(STAKE_AMOUNT);
            emit ReportRejected(_reportId, report.relayer);
        }
    }

    receive() external payable {}
}