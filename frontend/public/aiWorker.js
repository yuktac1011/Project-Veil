import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1/dist/transformers.min.js';

env.allowLocalModels = false;
env.useBrowserCache = true;

// --- 1. SPAM & QUALITY LOGIC ---
const detectSpamAndQuality = (text) => {
    const lower = text.toLowerCase();
    const issues = [];
    let isSpam = false;

    if (/(https?:\/\/[^\s]+)|(www\.[^\s]+)/g.test(text)) {
        isSpam = true; issues.push("External links detected");
    }
    if (/(.)\1{6,}/g.test(lower)) {
        isSpam = true; issues.push("Repetitive characters");
    }
    const words = lower.split(/\s+/);
    if (words.some(word => word.length > 25)) {
        isSpam = true; issues.push("Invalid word structure");
    }
    const spamKeywords = ['buy', 'crypto', 'discount', 'free prize', 'earn money', 'subscribe'];
    if (spamKeywords.filter(word => lower.includes(word)).length >= 2) {
        isSpam = true; issues.push("Marketing intent detected");
    }
    return { isSpam, issues };
};

// --- 1.5 SENTIMENT LOGIC (Restored) ---
const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    
    const sentimentMap = {
        distress: ['sad', 'scared', 'afraid', 'terrified', 'hurt', 'pain', 'suffering', 'help', 'emergency', 'danger', 'dying', 'killed', 'please', 'critical', 'trapped', 'sos'],
        mockery: ['lol', 'lmao', 'haha', 'rofl', 'funny', 'joke', 'stupid', 'loser', 'idiot', 'rekt', 'fake', 'prank', 'kek', 'joking'],
        anger: ['angry', 'furious', 'hate', 'rage', 'mad', 'disgust', 'stupid', 'incompetent', 'useless', 'damn', 'hell'],
        neutral: []
    };

    let scores = { distress: 0, mockery: 0, anger: 0 };

    Object.entries(sentimentMap).forEach(([label, words]) => {
        if (label === 'neutral') return;
        words.forEach(w => { 
            if (lower.includes(w)) scores[label]++; 
        });
        if (label === 'mockery') scores[label] *= 1.5; 
    });

    if (scores.mockery > scores.distress && scores.mockery > scores.anger) {
        return { label: 'mockery', score: Math.min(0.9, 0.5 + (scores.mockery * 0.1)) };
    }
    if (scores.distress > 0) {
        return { label: 'distress', score: Math.min(0.95, 0.6 + (scores.distress * 0.1)) };
    }
    if (scores.anger > 0) {
        return { label: 'anger', score: Math.min(0.9, 0.5 + (scores.anger * 0.1)) };
    }

    return { label: 'neutral', score: 0.5 };
};

// --- 2. CATEGORIZATION LOGIC ---
const analyzeTextData = (text) => {
    const lower = text.toLowerCase();
    const categories = {
        'Violent Crime': ['kill', 'murder', 'stab', 'gun', 'shoot', 'knife', 'beat', 'hit', 'assault', 'attack', 'blood'],
        'Theft/Property': ['stole', 'robbed', 'theft', 'burglary', 'broke in', 'wallet', 'money', 'phone', 'car'],
        'Corruption/Fraud': ['bribe', 'corruption', 'embezzle', 'scam', 'fraud', 'official', 'government', 'police'],
        'Harassment/Abuse': ['harass', 'stalk', 'threat', 'bully', 'abuse', 'domestic', 'rape', 'sexual', 'follow'],
        'Cybercrime': ['hack', 'online', 'internet', 'password', 'email', 'crypto', 'phishing', 'virus', 'data'],
        'Drug/Trafficking': ['drug', 'deal', 'cocaine', 'heroin', 'weed', 'traffic', 'cartel', 'dealer']
    };

    let bestCategory = 'General Incident';
    let maxKeywords = 0;
    let relevantKeywords = [];

    for (const [category, keywords] of Object.entries(categories)) {
        let matchCount = 0;
        keywords.forEach(word => { if (lower.includes(word)) matchCount++; });
        if (matchCount > maxKeywords) {
            maxKeywords = matchCount;
            bestCategory = category;
            relevantKeywords = keywords;
        }
    }

    return { 
        label: bestCategory, 
        confidence: maxKeywords >= 3 ? 99 : (maxKeywords === 2 ? 85 : 60), 
        summary: text.split('.')[0] + '...' 
    };
};

// --- 2.5 PII DETECTION (Fixed Regex) ---
const detectPII = (text) => {
    const findings = [];
    // More inclusive regex
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
    const phoneRegex = /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/g; 
    
    const emails = text.match(emailRegex);
    if (emails) emails.forEach(e => findings.push({ type: 'Email', value: e }));
    
    const phones = text.match(phoneRegex);
    if (phones) phones.forEach(p => findings.push({ type: 'Phone', value: p }));
    
    return findings;
};

// --- 3. MODEL LOADERS ---
class TextClassifier {
    static instance = null;
    static async getInstance(progress_callback) {
        if (this.instance === null) {
            this.instance = await pipeline('text-classification', 'Xenova/toxic-bert', { progress_callback });
        }
        return this.instance;
    }
}

class ImageClassifier {
    static instance = null;
    static async getInstance(progress_callback) {
        if (this.instance === null) {
            // Using a lighter model for speed or the requested one
            this.instance = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', { progress_callback });
        }
        return this.instance;
    }
}

// --- 4. WORKER HANDLER ---
self.addEventListener('message', async (event) => {
    const { text, image } = event.data;
    try {
        if (image) {
            self.postMessage({ status: 'loading', data: { status: 'initiate', msg: 'Loading CLIP Vision...' } });
            const classifier = await ImageClassifier.getInstance((data) => {
                if (data.status === 'progress') self.postMessage({ status: 'loading', data });
            });
            
            // Expanded labels for better detection
            const candidate_labels = [
                'weapon', 'gun', 'knife', 'pistol', 'rifle', 'firearm',
                'violence', 'fighting', 'blood', 'injury', 'dead body',
                'drugs', 'pills', 'cocaine', 'weed',
                'id card', 'passport', 'document', 
                'safe', 'nature', 'city', 'room'
            ];
            
            const output = await classifier(image, candidate_labels);
            self.postMessage({ status: 'image_complete', output });
            return;
        }

        if (text) {
            self.postMessage({ status: 'loading', data: { status: 'initiate', msg: 'Loading BERT NLP...' } });
            const classifier = await TextClassifier.getInstance((data) => {
                if (data.status === 'progress') self.postMessage({ status: 'loading', data });
            });
            const output = await classifier(text, { topk: null });
            const scores = output.reduce((acc, curr) => ({ ...acc, [curr.label]: curr.score }), {});

            self.postMessage({ 
                status: 'text_complete', 
                output: { 
                    scores, 
                    category: analyzeTextData(text),
                    spam: detectSpamAndQuality(text),
                    pii: detectPII(text), // Use improved detection
                    sentiment: analyzeSentiment(text), 
                    hasContext: true 
                }
            });
        }
    } catch (error) {
        self.postMessage({ status: 'error', error: error.message });
    }
});