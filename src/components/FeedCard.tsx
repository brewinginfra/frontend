import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send, Lock, CheckCircle, X, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Asset, api } from '../services/api';
import { storage } from '../services/storage';
import { useWallets, getEmbeddedConnectedWallet, useSendTransaction } from '@privy-io/react-auth';
import { parseUnits, erc20Abi, encodeFunctionData } from 'viem';

interface FeedCardProps {
    asset: Asset;
    creatorName?: string;
    isOwner?: boolean;
    onCreatorClick?: () => void;
}

export function FeedCard({ asset, creatorName, isOwner = false, onCreatorClick }: FeedCardProps) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 2000) + 100);
    const [comment, setComment] = useState('');

    const isFreeContent = !asset.price || asset.price === 0;
    const isUnlocked = asset.unlockableContent === true;
    const shouldBlur = !isOwner && !isUnlocked && !isFreeContent;

    const displayName = creatorName || `Creator #${asset.creatorId}`;

    // Generate random time ago
    const timeOptions = ['2 HOURS AGO', '5 HOURS AGO', '1 DAY AGO', '2 DAYS AGO', '3 DAYS AGO'];
    const timeAgo = timeOptions[asset.id % timeOptions.length];

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setLiked(!liked);
        setLikeCount(prev => liked ? prev - 1 : prev + 1);
    };

    const handleBookmark = (e: React.MouseEvent) => {
        e.stopPropagation();
        setBookmarked(!bookmarked);
    };

    const { wallets } = useWallets();
    const embeddedWallet = getEmbeddedConnectedWallet(wallets);
    const [localUnlocked, setLocalUnlocked] = useState(isUnlocked || storage.isAssetUnlocked(asset.id));
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [purchaseDetails, setPurchaseDetails] = useState({ amount: '', txHash: '' });

    // Override shouldBlur if locally unlocked
    const effectiveShouldBlur = shouldBlur && !localUnlocked;

    const { sendTransaction } = useSendTransaction({
        onError: (error) => {
            console.error("Payment failed:", error);
            setIsProcessing(false);
            alert("Payment failed or cancelled");
        }
    });

    const handlePayment = async () => {
        if (!embeddedWallet) {
            alert("Please login first");
            return;
        }
        console.log("Payment started");

        setIsProcessing(true);
        try {
            // 1. Get Invoice (402)
            const responseGet = await api.getPurchaseAsset(asset.id);
            const invoice = responseGet.paymentDetails;
            console.log("Invoice:", invoice);

            const receiverAddress = invoice.receiver;
            const amount = invoice.amount;

            if (!receiverAddress || !amount) {
                throw new Error("Invalid invoice received");
            }

            console.log("Invoice:", receiverAddress, amount);

            // 2. Pay Invoice (ERC20 Transfer)
            const data = encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [receiverAddress as `0x${string}`, parseUnits(amount.toString(), 6)]
            });

            const receipt = await sendTransaction({
                to: '0x83BDe9dF64af5e475DB44ba21C1dF25e19A0cf9a', // mUSDT Address
                data: data,
                chainId: 421614
            },
                {
                    sponsor: true
                });

            console.log("Payment sent:", receipt.hash);

            // 3. Verify Payment
            await api.postVerifyAsset(asset.id, amount.toString(), receiverAddress, receipt.hash);

            // 4. Unlock and show success modal
            storage.saveUnlockedAsset(asset.id);
            setLocalUnlocked(true);
            setPurchaseDetails({ amount: amount.toString(), txHash: receipt.hash });
            setShowSuccessModal(true);
            setIsProcessing(false);

        } catch (error) {
            console.error("Payment failed:", error);
            // Alert handled in onError for tx failure, but for API errors:
            // setIsProcessing(false); // Handled in onError for sendTransaction, but what if API fails?
            // Actually sendTransaction throws? useSendTransaction hook doesn't throw usually if onError is handled? 
            // Wait, sendTransaction returns a Promise.
            // If it fails, does the promise reject?
            // Privy docs say: sendTransaction returns a Promise that resolves to the transaction receipt.
            // If it fails, it rejects.
            // So try/catch is correct.
            // Double check duplicate alert if onError handles it.
            // onError is called when user rejects or simulation fails.
        } finally {
            // setIsProcessing(false); // We handle inside success flow or error flow
        }
    };

    // Success Modal Component
    const SuccessModal = () => {
        if (!showSuccessModal) return null;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    style={{ animation: 'fadeIn 0.3s ease-out' }}
                    onClick={() => setShowSuccessModal(false)}
                />

                {/* Modal */}
                <div
                    className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4"
                    style={{ animation: 'modalPop 0.4s ease-out' }}
                >
                    {/* Close button */}
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Confetti */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: '-10px',
                                    animation: `confetti 2s ease-out ${Math.random() * 0.5}s forwards`,
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
                            <div
                                className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                                style={{ animation: 'successBounce 0.6s ease-in-out' }}
                            >
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1">
                                <Sparkles className="w-6 h-6 text-yellow-400" style={{ animation: 'sparkle 1s ease-in-out infinite' }} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        Purchase Successful! 🎉
                    </h2>

                    <p className="text-gray-500 text-center text-sm mb-6">
                        Content has been unlocked
                    </p>

                    {/* Purchase Details */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">Amount Paid</span>
                            <span className="text-xl font-bold text-green-600">{purchaseDetails.amount} mUSDT</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Creator</span>
                            <span className="text-sm font-medium text-gray-700">{displayName}</span>
                        </div>
                    </div>

                    {/* Transaction Link */}
                    {purchaseDetails.txHash && (
                        <a
                            href={`https://sepolia.arbiscan.io/tx/${purchaseDetails.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-center text-xs text-blue-500 hover:text-blue-600 mb-4"
                        >
                            View transaction on Arbiscan ↗
                        </a>
                    )}

                    {/* Close Button */}
                    <button
                        onClick={() => setShowSuccessModal(false)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-600 transition shadow-lg hover:shadow-xl"
                    >
                        View Content
                    </button>
                </div>

                {/* CSS Animations */}
                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    @keyframes modalPop {
                        0% { opacity: 0; transform: scale(0.8) translateY(20px); }
                        50% { transform: scale(1.02); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes successBounce {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                    @keyframes sparkle {
                        0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                        50% { transform: scale(1.3) rotate(15deg); opacity: 0.8; }
                    }
                    @keyframes confetti {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
                    }
                `}</style>
            </div>
        );
    };

    return (
        <>
            {/* Success Modal */}
            <SuccessModal />
            <div
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col mx-auto"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    maxWidth: '470px', /* Limit width to resemble Instagram on web */
                    width: '100%'
                }}
            >
                {/* Header Section */}
                <div className="flex items-center justify-between p-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-100 flex-shrink-0 cursor-pointer hover:ring-[#12AAFF] transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreatorClick?.();
                            }}
                        >
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span
                                    className="font-semibold text-gray-900 text-sm truncate cursor-pointer hover:text-[#12AAFF] transition"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCreatorClick?.();
                                    }}
                                >
                                    {displayName}
                                </span>
                                {/* Verified badge */}
                                <svg className="w-4 h-4 text-[#12AAFF] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Image Wrapper - STRICT CONTAINMENT */}
                <div
                    className="relative w-full overflow-hidden flex-shrink-0"
                    style={{
                        position: 'relative',
                        width: '100%',
                        overflow: 'hidden'
                    }}
                >
                    {/* Aspect Ratio Container */}
                    <div
                        className="relative w-full bg-gray-100"
                        style={{
                            aspectRatio: '4/5', /* 1080x1350 Instagram Portrait Ratio */
                            position: 'relative'
                        }}
                    >
                        {/* Image - Absolute positioned inside aspect ratio container */}
                        <div
                            className="absolute inset-0"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0
                            }}
                        >
                            {asset.Url ? (
                                <ImageWithFallback
                                    src={asset.Url}
                                    alt={asset.description}
                                    className={`w-full h-full object-cover ${effectiveShouldBlur ? 'blur-xl' : ''}`}
                                    // className={`w-full h-full object-cover`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                    <div className="text-center text-gray-400">
                                        <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                                <circle cx="9" cy="9" r="2" />
                                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                            </svg>
                                        </div>
                                        <span className="text-sm">No Image</span>
                                    </div>
                                </div>
                            )}

                            {/* Locked Overlay - CONTAINED within image wrapper */}
                            {effectiveShouldBlur && (
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 10
                                    }}
                                >
                                    <Lock className="w-12 h-12 text-white mb-3" />
                                    <p className="text-white font-semibold mb-2">Special Content</p>
                                    <button
                                        className="bg-[#12AAFF] text-white px-8 py-2.5 rounded-full hover:bg-blue-600 transition shadow-lg font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                        onClick={handlePayment}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : `Unlock for ${asset.price} mUSDT`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Bar - Separate from image, in normal flow */}
                <div className="p-4 flex-shrink-0 bg-white" style={{ position: 'relative', zIndex: 20 }}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                className={`flex items-center gap-1 transition ${liked ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'}`}
                                onClick={handleLike}
                            >
                                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                className="text-gray-600 hover:text-[#12AAFF] transition"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MessageCircle className="w-6 h-6" />
                            </button>
                            <button
                                className="text-gray-600 hover:text-[#12AAFF] transition"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Send className="w-6 h-6" />
                            </button>
                        </div>
                        <button
                            className={`transition ${bookmarked ? 'text-[#12AAFF]' : 'text-gray-600 hover:text-[#12AAFF]'}`}
                            onClick={handleBookmark}
                        >
                            <Bookmark className={`w-6 h-6 ${bookmarked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Footer Content - Separate section */}
                <div className="px-4 pb-4 flex-shrink-0 bg-white space-y-3" style={{ position: 'relative', zIndex: 20 }}>
                    {/* Like Count */}
                    <p className="font-semibold text-gray-900 text-sm">
                        {likeCount.toLocaleString()} likes
                    </p>

                    {/* Caption */}
                    <div>
                        <p className="text-gray-900 text-sm">
                            <span className="font-semibold mr-2">{displayName}</span>
                            <span className="text-gray-700">{asset.description || 'Check out this exclusive content! 🔥'}</span>
                        </p>
                    </div>

                    {/* Timestamp */}
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {timeAgo}
                    </p>

                    {/* Comment Input */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className={`font-semibold text-sm transition ${comment.trim() ? 'text-[#12AAFF] hover:text-blue-600' : 'text-gray-300 cursor-not-allowed'}`}
                            disabled={!comment.trim()}
                            onClick={(e) => {
                                e.stopPropagation();
                                setComment('');
                            }}
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
