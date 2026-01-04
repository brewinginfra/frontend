import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StoriesBar } from './StoriesBar';
import { Feed } from './Feed';
import { SuggestionsPanel } from './SuggestionsPanel';
import { Discover } from './Discover';
import { Chat } from './Chat';
import { Bookmarks } from './Bookmarks';
import { AssetSubmission } from './AssetSubmission';
import { AssetList } from './AssetList';
import { AssetDetail } from './AssetDetail';
import { storage } from '../services/storage';
import { useEffect, useState } from 'react';
import { Earnings } from './Earnings';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSendTransaction, usePrivy, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth'
import { useBalance } from 'wagmi'
import { megaethTestnet, riseTestnet, arbitrumSepolia } from 'viem/chains'
import { Check, Copy } from 'lucide-react'
import { createWalletClient, createPublicClient, http, custom, type Hex, type WalletClient, formatEther, formatUnits, erc20Abi, parseUnits } from 'viem'
import { useReadContract, useWaitForTransactionReceipt } from 'wagmi'
import { useAutoRegisterCreator } from '../hooks/useAutoRegisterCreator'


export function MainApp() {
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const { wallets } = useWallets();
  const embeddedWallet = getEmbeddedConnectedWallet(wallets)
  const { login, logout, authenticated } = usePrivy()
  const { sendTransaction } = useSendTransaction()

  // Auto-register creator when user authenticates via Privy
  const { isRegistering, isRegistered, error: registrationError, creatorId } = useAutoRegisterCreator();

  const [lastTxHash, setLastTxHash] = useState<string | null>(null)
  const [lastContractHash, setLastContractHash] = useState<string | null>(null)
  const [isSendingTx, setIsSendingTx] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState(false)
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null)

  // X402 State
  const [x402Status, setX402Status] = useState<'idle' | 'fetching_payment_info' | 'sending_payment' | 'verifying' | 'success' | 'error'>('idle');
  const [x402Message, setX402Message] = useState<string>('');
  const [protectedData, setProtectedData] = useState<any>(null);

  const chainId = embeddedWallet?.chainId ? parseInt(embeddedWallet.chainId.split(':')[1]) : null

  const { data: balance, refetch: refetchBalance } = useBalance({
    address: embeddedWallet?.address as `0x${string}`,
    chainId: chainId!
  })

  // Fetch token balance explicitly using useReadContract to avoid useBalance token parameter issues
  const { data: tokenBalanceRaw, refetch: refetchTokenBalance } = useReadContract({
    address: '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a',
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [embeddedWallet?.address as `0x${string}`],
    chainId: chainId!,
    query: {
      enabled: !!embeddedWallet?.address && !!chainId
    }
  })

  const tokenBalanceFormatted = tokenBalanceRaw ? formatUnits(tokenBalanceRaw as bigint, 6) : '0'
  const sepoliaBalance = balance ? formatEther(balance.value) : '0'

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: lastTxHash as `0x${string}`,
  })

  useEffect(() => {
    if (isConfirmed) {
      refetchBalance()
      refetchTokenBalance()
    }
  }, [isConfirmed, refetchBalance, refetchTokenBalance])

  useEffect(() => {
    const createClient = async () => {
      if (embeddedWallet && chainId) {
        try {
          const provider = await embeddedWallet.getEthereumProvider()
          const client = createWalletClient({
            account: embeddedWallet.address as Hex,
            chain: arbitrumSepolia,
            transport: custom(provider!),
          })
          setWalletClient(client)
        } catch (error) {
          console.error('Failed to create wallet client:', error)
          setWalletClient(null)
        }
      } else {
        setWalletClient(null)
      }
    }

    createClient()
  }, [embeddedWallet?.address, chainId])

  const handleX402Flow = async () => {
    if (!walletClient || !embeddedWallet) {
      setX402Message("Wallet not connected.");
      return;
    }

    setX402Status('fetching_payment_info');
    setX402Message("Requesting protected resource...");
    setProtectedData(null);

    try {
      // Step 1: Request Resource
      const response = await fetch('http://localhost:8000/x402', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 402) {
        const errorData = await response.json();
        setX402Message(`Resource protected. Payment Required.\nDetails: ${JSON.stringify(errorData.paymentDetails, null, 2)}`);

        const { receiver, amount, tokenAddress, decimals } = errorData.paymentDetails;

        if (!receiver || !amount || !tokenAddress) {
          throw new Error("Invalid payment details received.");
        }

        // Step 2: Send Payment
        setX402Status('sending_payment');
        setX402Message((prev) => prev + `\n\nInitiating payment of ${amount} mUSDT to ${receiver}...`);

        const hash = await walletClient.writeContract({
          account: embeddedWallet.address as Hex,
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'transfer',
          args: [receiver as `0x${string}`, parseUnits(amount, decimals)],
          chain: arbitrumSepolia
        });

        setX402Message((prev) => prev + `\nTransaction sent! Hash: ${hash}\nWaiting for confirmation...`);

        // Wait for confirmation
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http()
        });

        await publicClient.waitForTransactionReceipt({ hash });

        setX402Message((prev) => prev + `\nTransaction confirmed! Verifying with server...`);

        // Step 3: Verify Payment
        setX402Status('verifying');

        const verifyResponse = await fetch('http://localhost:8000/x402/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ txHash: hash })
        });

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          setX402Status('success');
          setProtectedData(verifyData);
          setX402Message((prev) => prev + `\n\nAccess Granted!`);
        } else {
          throw new Error(verifyData.error || "Verification failed");
        }

      } else if (response.ok) {
        // Already paid or free?
        const data = await response.json();
        setX402Status('success');
        setProtectedData(data);
        setX402Message("Resource accessed successfully (no payment required).");
      } else {
        throw new Error(`Unexpected status: ${response.status}`);
      }

    } catch (error: any) {
      console.error("X402 Flow Error:", error);
      setX402Status('error');
      setX402Message((prev) => prev + `\n\nError: ${error.message}`);
    }
  };

  const handleFaucet = async () => {
    if (!walletClient) return;
    try {
      setIsClaiming(true);
      const hash = await walletClient.writeContract({
        account: embeddedWallet?.address as Hex,
        address: '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a',
        abi: [{
          name: 'faucet',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [],
          outputs: []
        }],
        functionName: 'faucet',
        args: [],
        chain: arbitrumSepolia
      });
      setLastTxHash(hash);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  }

  const copyAddress = async () => {
    if (embeddedWallet?.address) {
      await navigator.clipboard.writeText(embeddedWallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const hasBalance = balance && balance.value > 0

  useEffect(() => {
    const handler = (e: any) => setSelectedAssetId(e.detail);
    window.addEventListener('route-asset-detail', handler);
    return () => window.removeEventListener('route-asset-detail', handler);
  }, []);

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    duration: 0.4
  };

  useEffect(() => {
    if (!authenticated) {
      navigate('/');
    }
  }, [authenticated]);

  // Log registration status for debugging
  useEffect(() => {
    if (isRegistering) {
      console.log('[MainApp] Registering creator...');
    }
    if (isRegistered && creatorId) {
      console.log('[MainApp] Creator registered with ID:', creatorId);
    }
    if (registrationError) {
      console.error('[MainApp] Registration error:', registrationError);
    }
  }, [isRegistering, isRegistered, creatorId, registrationError]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-gray-900">
      <TopBar embeddedWalletAddress={embeddedWallet?.address} />
      <div className="flex">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        <main className="flex-1 flex">
          <div className="flex-1 max-w-3xl mx-auto overflow-hidden">
            <AnimatePresence mode="wait">
              {activePage === 'home' && (
                <motion.div
                  key="home"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <StoriesBar />
                  <Feed />
                </motion.div>
              )}
              {activePage === 'discover' && (
                <motion.div
                  key="discover"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Discover />
                </motion.div>
              )}
              {activePage === 'messages' && (
                <motion.div
                  key="messages"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Chat />
                </motion.div>
              )}
              {activePage === 'bookmarks' && (
                <motion.div
                  key="bookmarks"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Bookmarks />
                </motion.div>
              )}
              {activePage === 'register' && (
                <motion.div
                  key="register"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  {/* Show loading while auto-registration is in progress */}
                  {isRegistering ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-12 h-12 border-4 border-[#12AAFF]/30 border-t-[#12AAFF] rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-500">Setting up your creator profile...</p>
                    </div>
                  ) : (
                    <AssetSubmission
                      onSuccess={() => setActivePage('my-assets')}
                      onRedirectToRegister={() => setActivePage('register')}
                    />
                  )}
                </motion.div>
              )}
              {activePage === 'submit-asset' && (
                <motion.div
                  key="submit-asset"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AssetSubmission
                    onSuccess={() => setActivePage('assets')}
                    onRedirectToRegister={() => setActivePage('register')}
                  />
                </motion.div>
              )}
              {activePage === 'assets' && (
                <motion.div
                  key="assets"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AssetList onAssetClick={(id) => {
                    window.dispatchEvent(new CustomEvent('route-asset-detail', { detail: id }));
                    setActivePage('asset-detail');
                  }} />
                </motion.div>
              )}
              {activePage === 'my-assets' && (
                <motion.div
                  key="my-assets"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AssetList
                    creatorId={Number(storage.getCreatorId()) || 0}
                    onAssetClick={(id) => {
                      window.dispatchEvent(new CustomEvent('route-asset-detail', { detail: id }));
                      setActivePage('asset-detail');
                    }}
                  />
                </motion.div>
              )}
              {activePage === 'asset-detail' && selectedAssetId && (
                <motion.div
                  key="asset-detail"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <AssetDetail id={selectedAssetId} onBack={() => setActivePage('assets')} />
                </motion.div>
              )}
              {activePage === 'earnings' && (
                <motion.div
                  key="earnings"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={pageVariants}
                  transition={pageTransition}
                >
                  <Earnings />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {activePage !== 'messages' && activePage !== 'bookmarks' && activePage !== 'earnings' && <SuggestionsPanel />}
        </main>
      </div>
    </div>
  );
}
