import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useBalance } from 'wagmi';
import { arbitrumSepolia } from 'viem/chains';
import { useState, useRef, useEffect } from 'react';
import { Wallet, LogOut, ChevronDown, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { createWalletClient, createPublicClient, http, custom, formatEther, formatUnits, erc20Abi, parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { storage } from '@/services/storage';

interface WalletInfoProps {
  lastTransactionHash?: string | null;
}

export function WalletInfo({ lastTransactionHash }: WalletInfoProps) {
  const { logout, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((wallet) => wallet.walletClientType === 'privy');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  const address = embeddedWallet?.address;

  // Use wagmi to fetch balance specifically for this address and chain
  // Ensure we are using correct chain ID
  const chainId = arbitrumSepolia.id; 
  
  const { data: balance, refetch: refetchBalance } = useBalance({
      address: embeddedWallet?.address as `0x${string}`,
      chainId: chainId!
    })
  
    // Fetch token balance explicitly using useReadContract to avoid useBalance token parameter issues
    const { data: USDTBalance, refetch: refetchTokenBalance } = useReadContract({
      address: '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a',
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [embeddedWallet?.address as `0x${string}`],
      chainId: chainId!,
      query: {
        enabled: !!embeddedWallet?.address && !!chainId
      }
    })

    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: lastTransactionHash as `0x${string}`,
      })

  useEffect(() => {
      if (isConfirmed) {
        refetchBalance()
        refetchTokenBalance()
      }
    }, [isConfirmed, refetchBalance, refetchTokenBalance])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
      await logout();
      window.location.reload(); // Force reload to clear state effectively
      storage.clearCreatorId();
  };

  if (!authenticated || !address) {
      return null; // Or return a connect button if that's desired behavior in future
  }

  const shortenedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  // Format mUSDT balance (6 decimals)
  const formattedUSDT = USDTBalance 
    ? formatUnits(USDTBalance as bigint, 6)
    : '0';
    
  const displayBalance = USDTBalance !== undefined
    ? `${parseFloat(formattedUSDT).toFixed(2)} mUSDT`
    : 'Loading...';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-lg transition-all"
      >
        <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-gray-900">{displayBalance}</span>
            <span className="text-[10px] text-gray-500 font-mono">{shortenedAddress}</span>
        </div>
        <div className="w-8 h-8 bg-gradient-to-br from-[#12AAFF] to-[#0088DD] rounded-full flex items-center justify-center text-white shadow-sm">
            <Wallet size={14} />
        </div>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Embedded Wallet</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                        {arbitrumSepolia.name}
                    </span>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-gray-600 truncate">{address}</span>
                    <button 
                        onClick={handleCopy}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition"
                        title="Copy Address"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>

            <div className="p-2 space-y-1">
                 <div className="px-3 py-2 text-sm text-gray-600 flex justify-between">
                    <span>Native Balance:</span>
                    <span className="font-mono">{balance ? `${parseFloat(balance.formatted).toFixed(4)} ETH` : '...'}</span>
                 </div>
                 <button 
                    onClick={() => { refetchBalance(); refetchTokenBalance(); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                    <RefreshCw size={16} />
                    <span>Refresh Balance</span>
                 </button>
                 <a 
                    href={`${arbitrumSepolia.blockExplorers.default.url}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                    <ExternalLink size={16} />
                    <span>View on Explorer</span>
                 </a>
                 <div className="h-px bg-gray-100 my-1"></div>
                 <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                    <LogOut size={16} />
                    <span>Disconnect Wallet</span>
                 </button>
            </div>
        </div>
      )}
    </div>
  );
}

function Check({ size, className }: { size?: number, className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    )
}
