
// Simple heuristic-based AI content filter for client-side pre-checks.
// In a full production app, this would use TensorFlow.js or a lightweight model.

export interface AIAnalysisResult {
    isSpam: boolean;
    confidence: number;
    issues: string[];
}

export const analyzeContent = async (title: string, description: string): Promise<AIAnalysisResult> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    const issues: string[] = [];
    let spamScore = 0;

    const fullText = (title + " " + description).toLowerCase();

    // 1. Length Checks
    if (description.length < 20) {
        spamScore += 0.4;
        issues.push("Description is too short to be actionable.");
    }

    // 2. Keyword Analysis (Basic Spam Triggers)
    const spamKeywords = ['test', 'hello', 'asdf', '1234', 'crypto giveaway', 'free money', 'click here'];
    spamKeywords.forEach(word => {
        if (fullText.includes(word)) {
            spamScore += 0.3;
            issues.push(`Contains suspicious keyword: "${word}"`);
        }
    });

    // 3. Repetition Check
    const uniqueWords = new Set(fullText.split(/\s+/)).size;
    const totalWords = fullText.split(/\s+/).length;
    if (totalWords > 10 && uniqueWords / totalWords < 0.5) {
        spamScore += 0.4;
        issues.push("High repetition of words detected.");
    }

    // 4. CAPS LOCK Check
    const upperCaseCount = (title + description).replace(/[^A-Z]/g, "").length;
    const totalChars = (title + description).length;
    if (totalChars > 0 && upperCaseCount / totalChars > 0.6) {
        spamScore += 0.2;
        issues.push("Excessive use of uppercase letters.");
    }

    return {
        isSpam: spamScore >= 0.5,
        confidence: Math.min(spamScore, 1.0),
        issues
    };
};
