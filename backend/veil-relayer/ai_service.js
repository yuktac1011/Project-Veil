// Simple AI Simulation Service
const crypto = require('crypto');

/**
 * Validates report content using simulated AI models.
 * @param {string} text - The report description
 * @param {string} imageHash - Optional hash of the image
 * @returns {Promise<{decision: 'ALLOW' | 'REJECT', score: number, issues: string[]}>}
 */
async function validateContent(text, imageHash) {
    // simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const issues = [];
    let score = 0.95; // Default high score

    // 1. Text Toxicity Check (Simulation)
    const toxicKeywords = ['kill', 'murder', 'attack', 'bomb', 'hate'];
    // Note: In a crime reporting app, these might be VALID. 
    // So we should check for "Absurd" or "Spam" patterns instead for this demo.
    // Let's block "spam" or "test" short messages.

    if (!text || text.length < 10) {
        issues.push("Description too short");
        score -= 0.5;
    }

    if (text.toLowerCase().includes("spam")) {
        issues.push("Detected spam content");
        score -= 0.8;
    }

    // 2. Image Duplicate Check (Simulation)
    // We assume imageHash is passed. In a real app we'd query a DB of hashes.
    // Here we just check if it matches a "banned" hash.
    const BANNED_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Empty file hash
    if (imageHash === BANNED_HASH) {
        issues.push("Duplicate or invalid image detected");
        score -= 0.3;
    }

    // Decision Logic
    const decision = score > 0.5 ? 'ALLOW' : 'REJECT';

    return {
        decision,
        score,
        issues
    };
}

module.exports = {
    validateContent
};
