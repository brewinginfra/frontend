import { useState, useEffect } from 'react';
import { api, Asset } from '../services/api';
import { storage } from '../services/storage';
import { motion } from 'framer-motion';

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

    return (
        <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
                {creatorId ? 'My Assets' : 'Latest Assets'}
            </h2>
            <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => {
                    const isOwner = currentCreatorId === asset.creatorId;
                    const isUnlocked = asset.unlockableContent === true;
                    const shouldBlur = !isOwner && !isUnlocked;

                    // Debug logging
                    console.log('Asset ID:', asset.id, 'Creator:', asset.creatorId, 'Current User:', currentCreatorId, 'isOwner:', isOwner, 'shouldBlur:', shouldBlur);

                    return (
                        <motion.div
                            key={asset.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => onAssetClick(asset.id)}
                            className="bg-white p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-[#12AAFF] hover:shadow-md transition group flex flex-col"
                        >
                            <div className="aspect-video bg-gray-50 rounded-lg mb-3 overflow-hidden border border-gray-100 relative group-hover:border-blue-100 transition">
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                    {asset.Url ? (
                                        <img
                                            src={asset.Url}
                                            alt={asset.description}
                                            className={`w-full h-full object-cover group-hover:scale-105 transition duration-500 ${shouldBlur ? 'blur-md' : ''}`}
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                                            </div>
                                            <span className="text-xs font-medium text-gray-400">No Image</span>
                                        </div>
                                    )}
                                    <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-gray-50 text-gray-500 gap-2 p-4 text-center">
                                        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                                        </div>
                                        <span className="text-xs break-all line-clamp-2">Failed to load image</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-900 font-medium line-clamp-2 text-sm">{asset.description}</p>
                                    <div className="mt-2 text-xs text-blue-500">Creator #{asset.creatorId}</div>
                                </div>
                                <div className="bg-[#12AAFF]/10 text-[#12AAFF] px-3 py-1 rounded-full text-sm font-bold">
                                    {asset.price} ETH
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
