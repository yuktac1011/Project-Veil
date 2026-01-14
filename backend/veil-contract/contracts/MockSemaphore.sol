// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract MockSemaphore {
    
    /**
     * @dev Mimics the Semaphore V4 verifyProof signature.
     * We accept the Struct, print a log (conceptually), and return true.
     */
    function verifyProof(
        uint256 groupId,
        ISemaphore.SemaphoreProof calldata proof
    ) external view returns (bool) {
        // HACKATHON LOGIC: 
        // We bypass actual ZK math to ensure the demo works 100% of the time.
        // Just checking basic integrity.
        require(groupId > 0, "Invalid Group");
        require(proof.merkleTreeRoot > 0, "Invalid Root");
        return true;
    }

    /**
     * @dev Helper so the deploy script doesn't crash when creating a group.
     */
    function createGroup(uint256 groupId, address admin) external {
        // Mock success
    }
}