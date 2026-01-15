import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VeilIdentity, decryptVault, encryptVault } from '../utils/crypto';

interface OrgIdentity {
  token: string;
  name: string;
  orgId: string;
}

type UserRole = 'user' | 'admin' | null;

interface AuthState {
  identity: VeilIdentity | null;
  orgIdentity: OrgIdentity | null;
  userRole: UserRole;
  isLocked: boolean;
  hasVault: boolean;
  vaultData: string | null;
  
  // New: Session Data for Submission Flow
  walletAddress: string | null;
  zkProof: any | null; /* Persist Anon Aadhaar Proof */
  
  // Actions
  setVault: (encryptedData: string) => void;
  unlock: (passcode: string) => Promise<void>;
  lock: () => void;
  createIdentity: (identity: VeilIdentity, passcode: string) => Promise<void>;
  loginOrg: (org: OrgIdentity) => void;
  logout: () => void;
  
  // New Actions
  setWallet: (address: string | null) => void;
  setZkProof: (proof: any | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      identity: null,
      orgIdentity: null,
      userRole: null,
      isLocked: true,
      hasVault: !!localStorage.getItem('veil_vault'),
      vaultData: localStorage.getItem('veil_vault'),
      
      walletAddress: null,
      zkProof: null,

      setVault: (encryptedData: string) => {
        localStorage.setItem('veil_vault', encryptedData);
        set({ vaultData: encryptedData, hasVault: true });
      },

      unlock: async (passcode: string) => {
        const { vaultData } = get();
        if (!vaultData) throw new Error('No vault found');
        
        const decrypted = await decryptVault(vaultData, passcode);
        const identity = JSON.parse(decrypted);
        set({ identity, userRole: 'user', isLocked: false });
      },

      lock: () => set({ 
          identity: null, 
          orgIdentity: null, 
          userRole: null, 
          isLocked: true,
          walletAddress: null,
          zkProof: null
      }),

      createIdentity: async (identity: VeilIdentity, passcode: string) => {
        const encrypted = await encryptVault(JSON.stringify(identity), passcode);
        localStorage.setItem('veil_vault', encrypted);
        set({ 
          identity, 
          userRole: 'user',
          vaultData: encrypted, 
          hasVault: true, 
          isLocked: false 
        });
      },

      loginOrg: (org: OrgIdentity) => {
        set({ orgIdentity: org, userRole: 'admin', isLocked: false });
      },

      logout: () => {
        localStorage.removeItem('veil_vault');
        set({ 
            identity: null, 
            orgIdentity: null, 
            userRole: null, 
            vaultData: null, 
            hasVault: false, 
            isLocked: true,
            walletAddress: null,
            zkProof: null
        });
      },
      
      setWallet: (address) => set({ walletAddress: address }),
      setZkProof: (proof) => set({ zkProof: proof })
    }),
    {
      name: 'veil-auth-storage',
      partialize: (state) => ({ 
        orgIdentity: state.orgIdentity,
        userRole: state.userRole,
        // We probably WANT to persist wallet/proof for session refresh?
        // Or keep them memory only for better security?
        // For "Auth Page Setup" flow requests, persisting them 
        // implies user doesn't want to re-do it on refresh.
        // Let's persist them for now.
        walletAddress: state.walletAddress,
        zkProof: state.zkProof
      }),
    }
  )
);
