# 🔐 Project Veil – Privacy-First Decentralized Crime Reporting

**Team Name:** CodeSib  
**Hackathon:** GDGC Techsprint  
**Problem Statement:** Open Innovation – Project Veil  

---

## 🧩 Problem Statement

Managing crowd safety and public security is challenging due to the lack of **real-time, centralized, and trustworthy reporting systems**. Existing solutions are often:

- Manual and reactive  
- Centralized and prone to manipulation  
- Unsafe for whistleblowers due to identity exposure  

This results in **delayed responses**, underreporting of crimes, and poor situational awareness during emergencies.

---

## 💡 Our Solution

**Project Veil** is a **privacy-first, decentralized anonymous crime reporting platform** that enables citizens to report incidents **without revealing their identity**, while ensuring **credibility, spam resistance, and auditability**.

### Key Principles
- **Anonymous by design**
- **Zero-knowledge identity verification**
- **Decentralized & tamper-proof**
- **AI-assisted content filtering**
- **Reputation-based validation**

---

## 🚀 Core Features

- 🔐 **Anonymous Crime Reporting** using Zero-Knowledge Identity (Anon Aadhaar / Reclaim Protocol)
- 🧠 **AI-Based Content Filtering**
  - Violence & weapon detection (Transformer models)
  - Spam filtering
  - Email & phone number detection (Regex + NLP)
- 🛡️ **End-to-End Encrypted Submissions**
- ⛓️ **Immutable Storage**
  - Ethereum (Sepolia Testnet)
  - IPFS (via Pinata)
- 🗳️ **Decentralized Validator Voting**
  - Upvote / Downvote based verification
- ⭐ **Reputation-Weighted Consensus**
  - Prevents fake and malicious reports
- 🚫 **Sybil & Spam Resistance**
  - ZK Nullifiers to prevent duplicate submissions
- 📦 **Offline-First Reporting**
  - IndexedDB queue with secure sync when online
- 👮 **Secure Authority Dashboard**
  - Access only to verified, high-trust reports

---

## 🏗️ Architecture Overview

**High-Level Flow**
1. User submits a report anonymously
2. ZK proof verifies eligibility without revealing identity
3. AI filters content for spam, violence, and sensitive data
4. Encrypted report is stored on IPFS
5. Hash + metadata recorded on Ethereum
6. Validators vote on authenticity
7. Reputation-weighted consensus finalizes report
8. Verified reports become visible to authorities

---

## 🧪 Tech Stack

### 🔐 Privacy & Identity
- Anon Aadhaar / Reclaim Protocol
- Zero-Knowledge Proofs (ZK)
- Nullifiers for duplicate prevention

### 🧠 AI & Content Filtering
- JavaScript / TypeScript (Node.js)
- Transformer Models (Violence & Weapon Detection)
- Regex & NLP Filters (Email & Phone Detection)

### ⛓️ Blockchain & Web3
- Ethereum Sepolia Testnet
- Solidity (Smart Contracts)
- Ethers.js
- Alchemy RPC
- Web3 Faucet (Testnet ETH)

### 📦 Storage
- IPFS (Decentralized Storage)
- Pinata (IPFS Pinning)
- IndexedDB (Offline-first queue)

### 🗳️ Validation & Reputation
- Smart Contract Voting System
- Reputation-Weighted Consensus
- On-Chain Event Logs

### 🖥️ Frontend
- React.js
- Tailwind CSS
- Web Crypto API (Client-side encryption)

### 🛠️ Backend & Indexing
- Node.js
- Express.js
- REST APIs

### ☁️ Cloud & Dev Tools
- Google Cloud Platform (GCP)
- Gemini Deep Research
- Google AI Studio
- Anti-Gravity (AI-assisted code editor)

---

## 🖼️ MVP Highlights

- Anonymous report submission UI
- Validator dashboard with voting system
- Authority dashboard for verified reports
- Blockchain transaction tracking
- Offline reporting with auto-sync

---

## 🔮 Future Enhancements

- Integration with law enforcement systems
- Advanced AI threat-level analysis
- Cross-chain support for scalability
- Multilingual & accessibility support
- Geo-fencing and crime heatmap analytics
- Community governance via DAO model

---
