import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { api, Asset, CreatorProfile } from '../services/api';

export function CreatorPage() {
    const { creatorId } = useParams<{ creatorId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const focusAssetId = searchParams.get('focusAssetId');

    useEffect(() => {
        loadCreatorData();
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
        if (!creatorId) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch creator profile
            const profileData = await api.getCreatorProfile(Number(creatorId));
            setProfile(profileData);

            // Fetch all assets and filter by creator
            const allAssets = await api.getAssets();
            const creatorAssets = allAssets.filter(asset => asset.creatorId === Number(creatorId));
            setAssets(creatorAssets);
        } catch (err: any) {
            setError(err.message || 'Failed to load creator data');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (asset: Asset, index: number) => {
        setSelectedAsset(asset);
        setCurrentIndex(index);
    };

    const closeModal = () => {
        setSelectedAsset(null);
    };

    const goToPrevious = () => {
        const newIndex = (currentIndex - 1 + assets.length) % assets.length;
        setCurrentIndex(newIndex);
        setSelectedAsset(assets[newIndex]);
    };

    const goToNext = () => {
        const newIndex = (currentIndex + 1) % assets.length;
        setCurrentIndex(newIndex);
        setSelectedAsset(assets[newIndex]);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!selectedAsset) return;

            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedAsset, currentIndex]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-[#12AAFF] animate-spin" />
                    <p className="text-gray-500 text-sm">Loading creator profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Creator Not Found</h2>
                    <p className="text-gray-500 mb-6">{error || 'This creator does not exist.'}</p>
                    <button
                        onClick={() => navigate('/mainpage')}
                        className="px-6 py-2.5 bg-[#12AAFF] text-white rounded-full font-semibold hover:bg-blue-600 transition"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/mainpage')}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900">Creator Profile</h1>
                </div>
            </div>

            {/* Profile Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-3xl md:text-4xl ring-4 ring-gray-100 flex-shrink-0">
                            {profile.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h2>
                                {/* Verified Badge */}
                                <svg className="w-6 h-6 text-[#12AAFF]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-center md:justify-start gap-6 mb-4">
                                <div className="text-center md:text-left">
                                    <span className="font-bold text-gray-900 text-lg">{assets.length}</span>
                                    <span className="text-gray-500 text-sm ml-1">posts</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="font-bold text-gray-900 text-lg">{Math.floor(Math.random() * 5000) + 1000}</span>
                                    <span className="text-gray-500 text-sm ml-1">followers</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <span className="font-bold text-gray-900 text-lg">{Math.floor(Math.random() * 500) + 50}</span>
                                    <span className="text-gray-500 text-sm ml-1">following</span>
                                </div>
                            </div>

                            {/* Wallet Address */}
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                                <span className="font-mono">{profile.walletAddress.slice(0, 6)}...{profile.walletAddress.slice(-4)}</span>
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

            {/* Gallery Grid */}
            <div className="max-w-6xl mx-auto px-4 py-8">
                {assets.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                                <circle cx="9" cy="9" r="2" />
                                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No posts yet</h3>
                        <p className="text-gray-500 text-sm">This creator hasn't shared anything yet.</p>
                    </div>
                ) : (
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                    >
                        {assets.map((asset, index) => (
                            <motion.div
                                key={asset.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => openModal(asset, index)}
                            >
                                <img
                                    src={asset.Url}
                                    alt={asset.description}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <p className="font-semibold text-lg mb-1">View</p>
                                        {asset.price > 0 && (
                                            <p className="text-sm">{asset.price} mUSDT</p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Asset Modal/Lightbox */}
            <AnimatePresence>
                {selectedAsset && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={closeModal}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
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

                        {/* Asset Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl max-h-[90vh] w-full mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                <div className="grid md:grid-cols-2">
                                    {/* Image */}
                                    <div className="relative bg-black aspect-square md:aspect-auto">
                                        <img
                                            src={selectedAsset.Url}
                                            alt={selectedAsset.description}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="p-6 flex flex-col">
                                        {/* Creator Info */}
                                        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-sm">
                                                {profile.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{profile.name}</p>
                                                <p className="text-xs text-gray-500">Creator</p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1 py-4 overflow-y-auto">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {selectedAsset.description || 'No description provided.'}
                                            </p>
                                        </div>

                                        {/* Price Info */}
                                        {selectedAsset.price > 0 && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Price</span>
                                                    <span className="text-lg font-bold text-[#12AAFF]">{selectedAsset.price} mUSDT</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Counter */}
                                        <div className="pt-4 text-center text-sm text-gray-500">
                                            {currentIndex + 1} / {assets.length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
