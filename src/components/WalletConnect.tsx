import { useState, useEffect } from 'react';
import { Wallet, Copy, ExternalLink, LogOut } from 'lucide-react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';

export function WalletConnect() {
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string>('0');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        checkConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('chainChanged', () => window.location.reload());
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    const checkConnection = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.listAccounts();
                if (accounts.length > 0) {
                    const address = await accounts[0].getAddress();
                    setAccount(address);
                    updateBalance(address);
                }
            } catch (error) {
                console.error('Error checking connection:', error);
            }
        }
    };

    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            setAccount(null);
            setBalance('0');
        } else {
            setAccount(accounts[0]);
            updateBalance(accounts[0]);
        }
    };

    const updateBalance = async (address: string) => {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const balance = await provider.getBalance(address);
            setBalance(ethers.formatEther(balance));
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask to use this feature!');
            return;
        }

        setIsConnecting(true);
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            setAccount(accounts[0]);
            updateBalance(accounts[0]);
            setShowDropdown(false);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setBalance('0');
        setShowDropdown(false);
    };

    const copyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            alert('Address copied to clipboard!');
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const openEtherscan = () => {
        if (account) {
            window.open(`https://etherscan.io/address/${account}`, '_blank');
        }
    };

    if (!account) {
        return (
            <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
                <Wallet className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition border border-gray-700"
            >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm">{formatAddress(account)}</span>
                <span className="text-xs text-gray-400">{Number(balance).toFixed(4)} ETH</span>
            </button>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-72 bg-[#0f0f0f] border border-gray-800 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                        <div className="p-4 border-b border-gray-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">Your Wallet</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                                    <span className="text-xs text-green-500">Connected</span>
                                </div>
                            </div>
                            <div className="font-mono text-sm mb-2">{formatAddress(account)}</div>
                            <div className="text-lg font-semibold">{Number(balance).toFixed(4)} ETH</div>
                        </div>

                        <div className="p-2">
                            <button
                                onClick={copyAddress}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition text-left"
                            >
                                <Copy className="w-4 h-4" />
                                <span className="text-sm">Copy Address</span>
                            </button>
                            <button
                                onClick={openEtherscan}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-800 rounded-lg transition text-left"
                            >
                                <ExternalLink className="w-4 h-4" />
                                <span className="text-sm">View on Etherscan</span>
                            </button>
                            <button
                                onClick={disconnectWallet}
                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-600/20 text-red-500 rounded-lg transition text-left"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Disconnect</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Add TypeScript declarations for ethereum
declare global {
    interface Window {
        ethereum?: any;
    }
}
