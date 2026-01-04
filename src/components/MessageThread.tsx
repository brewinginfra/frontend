import { useState, useEffect } from 'react';
import { MoreVertical, Phone, Video, Image, Smile, DollarSign, Loader2, CheckCircle, X, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Conversation } from './Chat';
import { ethers } from 'ethers';
import { useSendTransaction, useWallets, getEmbeddedConnectedWallet } from '@privy-io/react-auth';
import { parseUnits, encodeFunctionData, erc20Abi, type Hex } from 'viem';
import { arbitrumSepolia } from 'viem/chains';

// Contract addresses
const CONTRACT_ESCROW = '0x7Dc28F76DAB22Ded9989a6Ed61e0d532c534D1E4';
const MUSDT_TOKEN = '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a';

// SendTip ABI
const SEND_TIP_ABI = [{
  "inputs": [
    { "internalType": "address", "name": "_creator", "type": "address" },
    { "internalType": "uint256", "name": "_amount", "type": "uint256" }
  ],
  "name": "sendTip",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}] as const;

interface Message {
  id: number;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'tip';
  amount?: string;
}

interface MessageThreadProps {
  conversation: Conversation;
}

// Success Modal Component
function SuccessModal({
  isOpen,
  onClose,
  tipAmount,
  recipientAddress
}: {
  isOpen: boolean;
  onClose: () => void;
  tipAmount: string;
  recipientAddress: string;
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-modal-pop">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Confetti effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
                backgroundColor: ['#12AAFF', '#FF6B6B', '#FFD93D', '#6BCB77', '#9B59B6'][i % 5],
                width: '8px',
                height: '8px',
                borderRadius: i % 2 === 0 ? '50%' : '2px',
              }}
            />
          ))}
        </div>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-success-bounce">
              <CheckCircle className="w-10 h-10 text-white animate-check-draw" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-6 h-6 text-yellow-400 animate-sparkle" />
            </div>
            <div className="absolute -bottom-1 -left-1">
              <Sparkles className="w-5 h-5 text-yellow-400 animate-sparkle delay-200" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2 animate-fade-up">
          Tip Sent Successfully! 🎉
        </h2>

        <p className="text-gray-500 text-center text-sm mb-6 animate-fade-up delay-100">
          Your tip has been sent to the creator's escrow
        </p>

        {/* Tip Details */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-4 mb-6 animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-xl font-bold text-orange-600">${tipAmount} mUSDT</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">To</span>
            <span className="text-xs font-mono text-gray-500">{recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</span>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 animate-fade-up delay-300">
          <p className="text-xs text-blue-700 text-center">
            💡 The creator has 24 hours to reply and claim your tip. If they don't reply, you can request a refund.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg hover:shadow-xl animate-fade-up delay-400"
        >
          Continue Chatting
        </button>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modal-pop {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          50% { transform: scale(1.02); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes check-draw {
          0% { stroke-dashoffset: 100; opacity: 0; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
          50% { transform: scale(1.3) rotate(15deg); opacity: 0.8; }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-modal-pop { animation: modal-pop 0.4s ease-out; }
        .animate-success-bounce { animation: success-bounce 0.6s ease-in-out; }
        .animate-check-draw { animation: check-draw 0.6s ease-out 0.2s both; }
        .animate-sparkle { animation: sparkle 1s ease-in-out infinite; }
        .animate-confetti { animation: confetti 2s ease-out forwards; }
        .animate-fade-up { animation: fade-up 0.4s ease-out both; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
    </div>
  );
}

export function MessageThread({ conversation }: MessageThreadProps) {
  const [messageText, setMessageText] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isAddressValid, setIsAddressValid] = useState(true);
  const [selectedTip, setSelectedTip] = useState<string>('');
  const [customTipAmount, setCustomTipAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTipDetails, setLastTipDetails] = useState({ amount: '', recipient: '' });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'them',
      content: 'Hey! Thanks so much for subscribing! 💕',
      timestamp: '10:30 AM',
      type: 'text',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Love your content! Keep it up!',
      timestamp: '10:32 AM',
      type: 'text',
    },
    {
      id: 3,
      sender: 'them',
      content: 'That means so much to me! 😊',
      timestamp: '10:33 AM',
      type: 'text',
    },
  ]);

  const { wallets } = useWallets();
  const embeddedWallet = getEmbeddedConnectedWallet(wallets);
  const { sendTransaction } = useSendTransaction();

  // Load wallet address from conversation or local storage
  useEffect(() => {
    if (conversation.walletAddress) {
      setWalletAddress(conversation.walletAddress);
    } else {
      const savedAddress = localStorage.getItem('creatorWalletAddress');
      if (savedAddress) {
        setWalletAddress(savedAddress);
      }
    }
  }, [conversation]);

  // Validate address when it changes
  useEffect(() => {
    if (!walletAddress) {
      setIsAddressValid(true);
      return;
    }

    const isValid = ethers.isAddress(walletAddress);
    setIsAddressValid(isValid);

    if (isValid) {
      localStorage.setItem('creatorWalletAddress', walletAddress);
    }
  }, [walletAddress]);

  // Get the actual tip amount
  const getTipAmount = (): string => {
    if (selectedTip === 'Custom') {
      return customTipAmount || '0';
    }
    return selectedTip || '0';
  };

  const handleSend = async () => {
    if (!messageText.trim() || !selectedTip || !walletAddress || !isAddressValid) return;
    if (!embeddedWallet) {
      console.error('No wallet connected');
      return;
    }

    const tipAmount = getTipAmount();
    if (parseFloat(tipAmount) <= 0) {
      console.error('Invalid tip amount');
      return;
    }

    setIsSending(true);

    try {
      const amountInWei = parseUnits(tipAmount, 6); // mUSDT has 6 decimals

      // Step 1: Approve token spending
      setIsApproving(true);
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [CONTRACT_ESCROW as Hex, amountInWei]
      });

      await sendTransaction({
        to: MUSDT_TOKEN,
        data: approveData,
        chainId: arbitrumSepolia.id
      }, {
        sponsor: true
      });

      setIsApproving(false);

      // Step 2: Send tip to escrow contract
      const sendTipData = encodeFunctionData({
        abi: SEND_TIP_ABI,
        functionName: 'sendTip',
        args: [walletAddress as Hex, amountInWei]
      });

      await sendTransaction({
        to: CONTRACT_ESCROW,
        data: sendTipData,
        chainId: arbitrumSepolia.id
      }, {
        sponsor: true
      });

      // Success! Add messages to chat
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMessages: Message[] = [
        {
          id: Date.now(),
          sender: 'me',
          content: messageText,
          timestamp: now,
          type: 'text',
        },
        {
          id: Date.now() + 1,
          sender: 'me',
          content: `$${tipAmount}`,
          timestamp: now,
          type: 'tip',
          amount: `${tipAmount} mUSDT`,
        },
      ];

      setMessages((prev) => [...prev, ...newMessages]);

      // Show success modal - Disabled per user request
      // setShowSuccessModal(true);

      // Reset form
      setMessageText('');
      setSelectedTip('');
      setCustomTipAmount('');

    } catch (error) {
      console.error('Failed to send tip:', error);
    } finally {
      setIsSending(false);
      setIsApproving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Success Modal */}
      {/* Success Modal - Hidden */},
      {/* <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        tipAmount={lastTipDetails.amount}
        recipientAddress={lastTipDetails.recipient}
      /> */}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ImageWithFallback
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{conversation.name}</span>
              {conversation.isVerified && (
                <svg className="w-4 h-4 text-[#12AAFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-green-500 font-medium">
              {conversation.isOnline ? 'Active now' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
              {message.type === 'text' && (
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${message.sender === 'me'
                    ? 'bg-[#12AAFF] text-white'
                    : 'bg-gray-100 text-gray-900'
                    }`}
                >
                  <p>{message.content}</p>
                </div>
              )}
              {message.type === 'tip' && (
                <div className="bg-orange-50 border border-orange-100 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 font-medium">Tip sent</span>
                  </div>
                  <p className="text-xl text-orange-500 font-bold">{message.amount}</p>
                </div>
              )}
              <span className="text-xs text-gray-400 mt-1 block px-2 text-right">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700 font-medium">Unlock messaging with a tip</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Send a tip to start the conversation (held in escrow for 24h)</p>

          {/* Tip Amount Selection */}
          <div className="flex gap-2 mb-3">
            {['5', '10', '20', 'Custom'].map((amount) => (
              <button
                key={amount}
                onClick={() => setSelectedTip(amount)}
                disabled={isSending}
                className={`flex-1 py-2 border rounded-lg transition text-sm font-medium ${selectedTip === amount
                  ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                  : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'
                  } disabled:opacity-50`}
              >
                {amount === 'Custom' ? 'Custom' : `$${amount}`}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          {selectedTip === 'Custom' && (
            <div className="mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="number"
                  value={customTipAmount}
                  onChange={(e) => setCustomTipAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                  className="w-full pl-7 pr-16 py-2 border border-orange-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mUSDT</span>
              </div>
            </div>
          )}

          {/* Wallet Address Input */}
          {/* Wallet Address Input - Hidden per user request */}
          {/* <div className="space-y-1">
            <label htmlFor="wallet-address" className="text-xs font-semibold text-orange-700">
              Creator Wallet Address
            </label>
            <input
              id="wallet-address"
              type="text"
              placeholder="0x... (creator wallet address)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              disabled={isSending}
              className={`w-full px-3 py-2 border rounded-md text-xs outline-none transition-all ${!isAddressValid && walletAddress
                ? 'border-red-500 focus:ring-1 focus:ring-red-200'
                : 'border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-100'
                } disabled:opacity-50`}
            />
            {!isAddressValid && walletAddress && (
              <p className="text-[10px] text-red-500 font-medium">
                Please enter a valid Ethereum address.
              </p>
            )}
          </div> */}

        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSend()}
            placeholder="Type a message and send with a tip..."
            disabled={isSending}
            className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 placeholder-gray-500 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!selectedTip || !walletAddress || !isAddressValid || !messageText.trim() || isSending || (selectedTip === 'Custom' && !customTipAmount)}
            className={`px-4 py-2 text-white rounded-full transition flex items-center gap-2 shadow-md ${!selectedTip || !walletAddress || !isAddressValid || !messageText.trim() || isSending || (selectedTip === 'Custom' && !customTipAmount)
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-lg'
              }`}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-bold">{isApproving ? 'Approving...' : 'Sending...'}</span>
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-bold">Tip & Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}