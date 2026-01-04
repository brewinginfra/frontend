import { useState, useEffect } from 'react';
import { api, Asset } from '../services/api';
import { storage } from '../services/storage';
import { motion } from 'framer-motion';
import { FeedCard } from './FeedCard';

interface AssetListProps {
    onAssetClick: (id: number) => void;
    creatorId?: number; // Optional filter
}

export function AssetList({ onAssetClick, creatorId }: AssetListProps) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCreatorId, setCurrentCreatorId] = useState<number | null>(null);

    useEffect(() => {
        loadAssets();
        const storedId = storage.getCreatorId();
        setCurrentCreatorId(storedId ? Number(storedId) : null);
    }, []);

    const loadAssets = async () => {
        try {
            const data = await api.getAssets();
            console.log("assets data: ", data);
            if (creatorId) {
                setAssets(data.filter(a => a.creatorId === creatorId));
            } else {
                setAssets(data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg m-4">
                {error}
                <button
                    onClick={loadAssets}
                    className="ml-4 underline hover:text-red-400"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Show empty state for "My Assets" when user is not a creator
    // When creatorId is undefined, it means user clicked "My Assets" but isn't a creator
    if (creatorId === undefined) {
        // User is viewing "My Assets" but is not a creator
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <circle cx="9" cy="9" r="2" />
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assets Yet</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-xs">
                    Become a creator to start uploading and selling your exclusive content!
                </p>
            </div>
        );
    }

    // Show empty state for creators who don't have any assets yet
    if (creatorId && assets.length === 0) {
        return (
            <div className="p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assets Yet</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-xs">
                    You haven't uploaded any content yet. Start sharing your exclusive content!
                </p>
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'submit-asset' }))}
                    className="px-6 py-2 bg-[#12AAFF] text-white font-medium rounded-full hover:bg-blue-600 transition"
                >
                    Upload Your First Asset
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {creatorId ? 'My Assets' : 'Latest Assets'}
            </h2>
            <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => {
                    const isOwner = currentCreatorId === asset.creatorId;

                    return (
                        <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <FeedCard
                                asset={asset}
                                creatorName={`Creator #${asset.creatorId}`}
                                isOwner={isOwner}
                                onClick={() => onAssetClick(asset.id)}
                            />
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
