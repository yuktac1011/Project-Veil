export const TERMS_OF_SERVICE = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing Project VEIL, you agree to be bound by these decentralized protocols. Unlike traditional platforms, VEIL operates via smart contracts and peer-to-peer networks. Your use of the platform constitutes acceptance of the cryptographic rules governing the network."
  },
  {
    title: "2. Decentralized Identity",
    content: "You are solely responsible for the management of your 'VeilIdentity' (Trapdoor and Nullifier). Project VEIL does not store your keys. If you lose your local vault passcode or backup phrase, your identity and all associated reports are permanently unrecoverable."
  },
  {
    title: "3. Reporting Conduct",
    content: "While VEIL provides anonymity, users are expected to submit truthful information. Malicious use of the platform for harassment or false reporting may result in your identity commitment being blacklisted by the community-governed relayer nodes."
  },
  {
    title: "4. No Central Authority",
    content: "Project VEIL is a decentralized autonomous tool. There is no central entity that can delete reports, reveal identities, or modify the blockchain record once a ZK-proof has been verified and submitted."
  }
];

export const PRIVACY_POLICY = [
  {
    title: "1. Data Minimization",
    content: "Our core philosophy is 'Privacy by Design'. We do not collect names, email addresses, IP addresses, or device identifiers. Your identity is represented solely by a cryptographic commitment."
  },
  {
    title: "2. Zero-Knowledge Proofs",
    content: "We use Semaphore ZK-protocols to verify your right to report without revealing who you are. The 'Relayer' only sees a valid proof and the encrypted payload destined for IPFS."
  },
  {
    title: "3. Local Storage",
    content: "Your sensitive data (private keys, draft reports) is stored exclusively in your browser's LocalStorage, encrypted with AES-GCM using your chosen passcode. This data never touches our servers."
  },
  {
    title: "4. Third-Party Services",
    content: "We utilize IPFS (InterPlanetary File System) for evidence storage. While the data is encrypted before upload, the CID (Content Identifier) is public on the distributed web."
  }
];
