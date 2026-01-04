import { useState, useEffect } from 'react';
import { CreatorConversationList } from './CreatorConversationList';
import { CreatorMessageThread } from './CreatorMessageThread';
import { createPublicClient, http, formatUnits } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';

// Contract Configuration
const CONTRACT_ESCROW = '0x7Dc28F76DAB22Ded9989a6Ed61e0d532c534D1E4';
const ESCROW_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "creator", "type": "address" }],
    "name": "getTipsByCreator",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "tips",
    "outputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
      { "internalType": "bool", "name": "processed", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export interface CreatorConversation {
  id: number;
  name: string; // Sender Address (shortened)
  address: string; // Full Sender Address
  username: string; // Placeholder or derived
  avatar: string; // Placeholder
  lastMessage: string; // Placeholder or status
  timestamp: string; // Time Remaining or Expired
  unread: number;
  isOnline: boolean;
  totalTips: number; // The amount of this specific tip
  lastTipAmount: number; // Same as totalTips for this view
  status: 'active' | 'expired';
  tipId: number;
}

export function CreatorChat() {
  const { wallets } = useWallets();
  const embeddedWallet = getEmbeddedConnectedWallet(wallets);
  const userAddress = embeddedWallet?.address;

  const [conversations, setConversations] = useState<CreatorConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<CreatorConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) return;

    const fetchTips = async () => {
      setIsLoading(true);
      try {
        const publicClient = createPublicClient({
          chain: arbitrumSepolia,
          transport: http(),
        });

        // 1. Get array of Tip IDs
        const tipIds = await publicClient.readContract({
          address: CONTRACT_ESCROW,
          abi: ESCROW_ABI,
          functionName: 'getTipsByCreator',
          args: [userAddress as `0x${string}`],
        });

        // 2. Fetch Tip struct for each ID
        const tipsData = await Promise.all(
          tipIds.map(async (id) => {
            const data = await publicClient.readContract({
              address: CONTRACT_ESCROW,
              abi: ESCROW_ABI,
              functionName: 'tips',
              args: [id],
            });
            return { id, data };
          })
        );

        // 3. Process and format data
        const now = BigInt(Math.floor(Date.now() / 1000));
        const OneDay = BigInt(24 * 60 * 60);

        const formattedConversations: CreatorConversation[] = tipsData.map(({ id, data }) => {
          // data is expected to be [sender, creator, amount, createdAt, processed]
          const [sender, _, amount, createdAt, processed] = data as [string, string, bigint, bigint, boolean];
          
          const tipSender = sender;
          const tipAmount = amount;
          const tipCreatedAt = createdAt;
          const tipProcessed = processed;

          const unlockTime = tipCreatedAt + OneDay;
          
          let status: 'active' | 'expired' = 'active';
          let timeDisplay = '';

          if (now > unlockTime) {
             status = 'expired';
             timeDisplay = 'Expired';
          } else {
             status = 'active';
             const diff = unlockTime - now;
             const hours = diff / BigInt(3600);
             timeDisplay = `Ends in ${hours}h`;
          }

          if (tipProcessed) {
             status = 'expired'; // Treat processed as not active
          }
          
          const formattedAmount = parseFloat(formatUnits(tipAmount, 6));

          return {
            id: Number(id), 
            tipId: Number(id),
            name: tipSender ? `${tipSender.slice(0, 6)}...${tipSender.slice(-4)}` : 'Unknown',
            address: tipSender,
            username: tipSender ? `${tipSender.slice(0, 4)}...${tipSender.slice(-4)}` : '@user',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop', // Dummy
            lastMessage: status === 'active' ? 'Tip Pending' : 'Tip Expired',
            timestamp: timeDisplay,
            unread: 0,
            isOnline: status === 'active',
            totalTips: formattedAmount,
            lastTipAmount: formattedAmount,
            status: status
          };
        });

        setConversations(formattedConversations);
        if (formattedConversations.length > 0) {
            // Preserve active conversation if it exists and is still in the list, otherwise default to first
            setActiveConversation(prev => {
                if (prev) {
                    const found = formattedConversations.find(c => c.id === prev.id);
                    return found || formattedConversations[0];
                }
                return formattedConversations[0];
            });
        }
      } catch (err) {
        console.error("Error fetching tips:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTips();
  }, [userAddress]);

  return (
    <div className="flex h-[calc(100vh-4rem)] border-x border-gray-200 bg-white">
      <CreatorConversationList
        conversations={conversations}
        activeConversation={activeConversation || conversations[0]}
        setActiveConversation={setActiveConversation}
        isLoading={isLoading}
      />
      {activeConversation ? (
        <CreatorMessageThread conversation={activeConversation} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
           Select a tip to view details
        </div>
      )}
    </div>
  );
}
