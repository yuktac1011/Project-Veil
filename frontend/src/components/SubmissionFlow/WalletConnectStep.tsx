import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { ethers } from 'ethers';

interface Props {
    onConnect: (address: string) => void;
}

export const WalletConnectStep: React.FC<Props> = ({ onConnect }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setIsConnecting(true);
        setError(null);
        try {
            if (!window.ethereum) {
                throw new Error("MetaMask is not installed");
            }

            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            
            if (accounts.length > 0) {
                onConnect(accounts[0]);
            } else {
                throw new Error("No accounts found");
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
        >
            <div className="flex justify-center">
                <div className="h-20 w-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Wallet size={40} />
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold">Connect Wallet</h2>
                <p className="text-zinc-400 mt-2">
                    Your wallet is used for signing transactions.<br/>
                    It is <span className="text-emerald-500 font-medium">NOT</span> linked to your identity.
                </p>
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <Button 
                onClick={connectWallet} 
                className="w-full py-6 text-lg"
                disabled={isConnecting}
            >
                {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </Button>
        </motion.div>
    );
};
