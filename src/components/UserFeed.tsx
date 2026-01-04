import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, Grid3x3, Film, Tag, X, ChevronLeft, ChevronRight, UserPlus, Loader2, Lock, AlertCircle } from 'lucide-react';
import { api, Asset, CreatorProfile } from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { storage } from '../services/storage';
import { useWallets, getEmbeddedConnectedWallet, useSendTransaction } from '@privy-io/react-auth';
import { parseUnits, erc20Abi, encodeFunctionData } from 'viem';

interface UserFeedProps {
    creatorId: number;
    onBack: () => void;
    onMessageClick?: (profile: CreatorProfile) => void;
}

type TabType = 'grid' | 'reels' | 'tagged';



export function UserFeed({ creatorId, onBack, onMessageClick }: UserFeedProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('grid');
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [purchasedAssets, setPurchasedAssets] = useState<Set<number>>(new Set());
    const [currentCreatorId, setCurrentCreatorId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const focusAssetId = searchParams.get('focusAssetId');

    // Wallet integration
    const { wallets } = useWallets();
    const embeddedWallet = getEmbeddedConnectedWallet(wallets);

    const { sendTransaction } = useSendTransaction({
        onError: (error) => {
            console.error("Payment failed:", error);
            setIsProcessing(false);
            setPaymentError("Payment failed or was cancelled. Please try again.");
        }
    });



    useEffect(() => {
        loadCreatorData();
        const storedId = storage.getCreatorId();
        setCurrentCreatorId(storedId ? Number(storedId) : null);


        // Load unlocked assets from localStorage
        const unlockedAssets = storage.getUnlockedAssets();
        setPurchasedAssets(unlockedAssets);
    }, [creatorId]);

    useEffect(() => {
        // Auto-open focused asset if specified
        if (focusAssetId && assets.length > 0) {
            const asset = assets.find(a => a.id === Number(focusAssetId));
            if (asset) {
                const index = assets.indexOf(asset);
                setSelectedAsset(asset);
                setCurrentIndex(index);
            }
        }
    }, [focusAssetId, assets]);

    const loadCreatorData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Fetch creator profile
            const profileData = await api.getCreatorProfile(creatorId);
            setProfile(profileData);

            // Fetch all assets and filter by creator
            const allAssets = await api.getAssets();
            const creatorAssets = allAssets.filter(asset => asset.creatorId === creatorId);
            setAssets(creatorAssets);
        } catch (err: any) {
            setError(err.message || 'Failed to load creator data');
        } finally {
            setLoading(false);
        }
    };

    const openAssetModal = (asset: Asset, index: number) => {
        setSelectedAsset(asset);
        setCurrentIndex(index);
        // Update URL with focusAssetId
        setSearchParams({ focusAssetId: asset.id.toString() });
    };

    const closeAssetModal = () => {
        setSelectedAsset(null);
        setPaymentError(null);
        setIsProcessing(false);
        // Remove focusAssetId from URL
        setSearchParams({});
    };

    const goToPrevious = () => {
        const newIndex = (currentIndex - 1 + assets.length) % assets.length;
        setCurrentIndex(newIndex);
        setSelectedAsset(assets[newIndex]);
        setSearchParams({ focusAssetId: assets[newIndex].id.toString() });
    };

    const goToNext = () => {
        const newIndex = (currentIndex + 1) % assets.length;
        setCurrentIndex(newIndex);
        setSelectedAsset(assets[newIndex]);
        setSearchParams({ focusAssetId: assets[newIndex].id.toString() });
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedAsset) return;
            if (e.key === 'Escape') closeAssetModal();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAsset, currentIndex]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        // TODO: Implement actual follow API call
    };

    const handleMessage = () => {
        if (profile && onMessageClick) {
            onMessageClick(profile);
        } else {
            console.log('Open message with creator:', creatorId);
        }
    };

    const handlePurchaseComplete = (assetId: number) => {
        // Add to purchased assets set
        setPurchasedAssets(prev => new Set(prev).add(assetId));

        // Update the asset in the assets array to mark it as unlocked
        setAssets(prevAssets =>
            prevAssets.map(asset =>
                asset.id === assetId
                    ? { ...asset, unlockableContent: true }
                    : asset
            )
        );
    };

    // Helper function to determine if asset is locked
    const isAssetLocked = (asset: Asset): boolean => {
        const isOwner = currentCreatorId === asset.creatorId;
        const isFreeContent = !asset.price || asset.price === 0;
        const isUnlocked = asset.unlockableContent === true;
        const isPurchased = purchasedAssets.has(asset.id);

        return !isOwner && !isUnlocked && !isFreeContent && !isPurchased;
    };

    // Handle unlock/purchase flow
    const handleUnlock = async (asset: Asset) => {
        if (!embeddedWallet) {
            setPaymentError("Please login first to unlock content");
            return;
        }

        setIsProcessing(true);
        setPaymentError(null);

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

            // 4. Update state - mark as unlocked
            handlePurchaseComplete(asset.id);

            // 5. Save to localStorage
            storage.saveUnlockedAsset(asset.id);

            setIsProcessing(false);

        } catch (error: any) {
            console.error("Payment failed:", error);
            setIsProcessing(false);
            setPaymentError(error.message || "Failed to unlock content. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <Loader2 className="w-8 h-8 text-[#12AAFF] animate-spin" />
                <p className="text-gray-500 text-sm">Loading profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl">
                    <p>{error || 'Creator not found'}</p>
                </div>
            </div>
        );
    }

    // Filter assets based on active tab
    const filteredAssets = assets; // For now, show all in grid. Can add filtering logic for reels/tagged

    return (
        <div className="max-w-4xl mx-auto pb-8">
            {/* Back Button */}
            <div className="px-4 py-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back</span>
                </button>
            </div>

            {/* Profile Header - Instagram Style */}
            <div className="px-4 md:px-8 py-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                    {/* Large Avatar */}
                    <div className="flex justify-center md:justify-start">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-5xl md:text-6xl ring-4 ring-gray-100 shadow-lg">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 space-y-4">
                        {/* Username + Buttons Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-normal text-gray-900">{profile.name}</h1>
                                {/* Verified Badge */}
                                <svg className="w-6 h-6 text-[#12AAFF]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleFollow}
                                    className={`px-6 py-1.5 rounded-lg font-semibold text-sm transition ${isFollowing
                                        ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                                        : 'bg-[#12AAFF] text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="px-6 py-1.5 bg-gray-200 text-gray-900 rounded-lg font-semibold text-sm hover:bg-gray-300 transition"
                                >
                                    Message
                                </button>
                                <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                                    <UserPlus className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-gray-900">{assets.length}</span>
                                <span className="text-gray-600">posts</span>
                            </div>
                            <button className="flex items-center gap-1 hover:text-gray-600 transition">
                                <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 5000) + 1000}</span>
                                <span className="text-gray-600">followers</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-gray-600 transition">
                                <span className="font-semibold text-gray-900">{Math.floor(Math.random() * 500) + 50}</span>
                                <span className="text-gray-600">following</span>
                            </button>
                        </div>

                        {/* Bio / Wallet */}
                        <div className="space-y-1">
                            <p className="text-sm text-gray-700">
                                Digital creator sharing exclusive content on the blockchain 🎨✨
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-mono text-gray-500">{profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}</span>
                                <a
                                    href={`https://sepolia.arbiscan.io/address/${profile.walletAddress}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#12AAFF] hover:text-blue-600 transition"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Row */}
            <div className="border-b border-gray-200">
                <div className="flex items-center justify-center gap-12 px-4">
                    <button
                        onClick={() => setActiveTab('grid')}
                        className={`flex items-center gap-2 py-3 border-t-2 transition ${activeTab === 'grid'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Grid3x3 className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Posts</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reels')}
                        className={`flex items-center gap-2 py-3 border-t-2 transition ${activeTab === 'reels'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Film className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Reels</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('tagged')}
                        className={`flex items-center gap-2 py-3 border-t-2 transition ${activeTab === 'tagged'
                            ? 'border-gray-900 text-gray-900'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Tag className="w-5 h-5" />
                        <span className="text-xs font-semibold uppercase tracking-wider hidden sm:inline">Tagged</span>
                    </button>
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="px-4 py-8">
                {filteredAssets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center">
                            <Grid3x3 className="w-8 h-8 text-gray-900" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No Posts Yet</h3>
                        <p className="text-gray-500 text-sm">When {profile.name} posts, you'll see them here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                        {filteredAssets.map((asset, index) => {
                            const isLocked = isAssetLocked(asset);

                            return (
                                <div
                                    key={asset.id}
                                    className="relative aspect-square bg-gray-100 cursor-pointer group overflow-hidden"
                                    onClick={() => openAssetModal(asset, index)}
                                >
                                    <img
                                        src={isLocked && asset.previewUrl ? asset.previewUrl : asset.Url}
                                        alt={asset.description}
                                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${isLocked ? 'blur-xl' : ''
                                            }`}
                                    />

                                    {/* Locked Overlay */}
                                    {isLocked && (
                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
                                            <Lock className="w-8 h-8 text-white mb-2" />
                                            <p className="text-white font-semibold text-sm">{asset.price} mUSDT</p>
                                            <p className="text-white/80 text-xs mt-1">Tap to unlock</p>
                                        </div>
                                    )}

                                    {/* Hover Overlay for unlocked content */}
                                    {!isLocked && (
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="text-white text-center space-y-2">
                                                {asset.price > 0 && (
                                                    <p className="font-semibold text-lg">{asset.price} mUSDT</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Post Viewer Modal */}
            <AnimatePresence>
                {selectedAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeAssetModal}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeAssetModal}
                            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition z-50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Buttons */}
                        {assets.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition z-50"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); goToNext(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/10 rounded-full transition z-50"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Asset Content - Defense in depth: check if locked */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-6xl max-h-[90vh] w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {(() => {
                                const isLocked = isAssetLocked(selectedAsset);

                                return (
                                    <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                        <div className="grid md:grid-cols-2">
                                            {/* Image */}
                                            <div className="relative bg-black aspect-square md:aspect-auto">
                                                {isLocked ? (
                                                    // Locked: Show blurred placeholder with lock overlay
                                                    <>
                                                        <img
                                                            src={selectedAsset.previewUrl || selectedAsset.Url}
                                                            alt={selectedAsset.description}
                                                            className="w-full h-full object-contain blur-3xl"
                                                        />
                                                        <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center">
                                                            <Lock className="w-16 h-16 text-white mb-4" />
                                                            <p className="text-white font-bold text-xl mb-2">Special Content</p>
                                                            <p className="text-white/80 text-sm mb-6">Unlock to view full content</p>

                                                            {/* Error Message */}
                                                            {paymentError && (
                                                                <div className="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 max-w-xs">
                                                                    <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                                                                    <p className="text-red-200 text-xs">{paymentError}</p>
                                                                </div>
                                                            )}

                                                            <button
                                                                onClick={() => handleUnlock(selectedAsset)}
                                                                disabled={isProcessing}
                                                                className="bg-[#12AAFF] text-white px-8 py-3 rounded-full hover:bg-blue-600 transition shadow-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                                            >
                                                                {isProcessing ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                                        Processing...
                                                                    </span>
                                                                ) : (
                                                                    `Unlock for ${selectedAsset.price} mUSDT`
                                                                )}
                                                            </button>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // Unlocked: Show real content
                                                    <img
                                                        src={selectedAsset.Url}
                                                        alt={selectedAsset.description}
                                                        className="w-full h-full object-contain"
                                                    />
                                                )}
                                            </div>

                                            {/* Details Sidebar */}
                                            <div className="flex flex-col max-h-[90vh]">
                                                {/* Header */}
                                                <div className="flex items-center gap-3 p-4 border-b border-gray-200">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-sm">
                                                        {profile.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{profile.name}</p>
                                                        <p className="text-xs text-gray-500">Creator</p>
                                                    </div>
                                                </div>

                                                {/* Description */}
                                                <div className="flex-1 p-4 overflow-y-auto">
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                                {profile.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm">
                                                                    <span className="font-semibold text-gray-900 mr-2">{profile.name}</span>
                                                                    <span className="text-gray-700">
                                                                        {isLocked
                                                                            ? 'This is special content. Unlock to view the full post and description.'
                                                                            : (selectedAsset.description || 'No description provided.')
                                                                        }
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="border-t border-gray-200 p-4 space-y-3">
                                                    {/* Price Info */}
                                                    {selectedAsset.price > 0 && (
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600">Price</span>
                                                            <span className="text-lg font-bold text-[#12AAFF]">{selectedAsset.price} mUSDT</span>
                                                        </div>
                                                    )}

                                                    {/* Lock Status */}
                                                    {isLocked && (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                            <p className="text-amber-800 text-sm font-medium flex items-center gap-2">
                                                                <Lock className="w-4 h-4" />
                                                                Locked Content
                                                            </p>
                                                        </div>
                                                    )}

                                                    {/* Counter */}
                                                    <div className="text-center text-sm text-gray-500">
                                                        {currentIndex + 1} / {assets.length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
