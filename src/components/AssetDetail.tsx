import { useState, useEffect } from 'react';
import { api, Asset } from '../services/api';
import { storage } from '../services/storage';
import { ArrowLeft } from 'lucide-react';

interface AssetDetailProps {
    id: number;
    onBack: () => void;
}

export function AssetDetail({ id, onBack }: AssetDetailProps) {
    const [asset, setAsset] = useState<Asset | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCreatorId, setCurrentCreatorId] = useState<number | null>(null);

    useEffect(() => {
        loadAsset();
        const storedId = storage.getCreatorId();
        setCurrentCreatorId(storedId ? Number(storedId) : null);
    }, [id]);

    const loadAsset = async () => {
        try {
            const data = await api.getAssetById(id);
            setAsset(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load asset details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
    );

    if (error || !asset) return (
        <div className="p-4">
            <button onClick={onBack} className="text-gray-400 hover:text-white mb-4 flex items-center gap-2">
                <ArrowLeft size={20} /> Back
            </button>
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg">
                {error || 'Asset not found'}
            </div>
        </div>
    );

    const isOwner = currentCreatorId === asset.creatorId;
    const isUnlocked = asset.unlockableContent === true;
    const shouldBlur = !isOwner && !isUnlocked;

    // Debug logging
    console.log('Detail View - Asset ID:', asset.id, 'Creator:', asset.creatorId, 'Current User:', currentCreatorId, 'isOwner:', isOwner, 'shouldBlur:', shouldBlur);

    return (
        <div className="p-4">
            <button onClick={onBack} className="text-gray-500 hover:text-gray-900 mb-4 flex items-center gap-2 font-medium transition">
                <ArrowLeft size={20} /> Back
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="aspect-video bg-gray-100 w-full flex items-center justify-center border-b border-gray-100 relative">
                    {asset.Url ? (
                        <>
                            <img
                                src={asset.Url}
                                alt={asset.description}
                                className={`w-full h-full object-contain ${shouldBlur ? 'blur-xl scale-110' : ''}`}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                            />
                            <a
                                href={asset.Url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden text-[#12AAFF] hover:underline break-all p-4 text-center font-medium absolute"
                            >
                                {asset.Url}
                            </a>
                        </>
                    ) : (
                        <span className="text-gray-500">No content URL</span>
                    )}
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Asset #{asset.id}</h1>
                            <p className="text-gray-500 text-sm">Created by Creator #{asset.creatorId}</p>
                        </div>
                        <div className="bg-[#12AAFF] px-4 py-2 rounded-lg text-white font-bold shadow-md">
                            {asset.price} ETH
                        </div>
                    </div>

                    <div className="prose max-w-none">
                        <h3 className="text-gray-900 font-semibold mb-2">Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{asset.description}</p>
                    </div>

                    {!isOwner && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <button className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-lg font-bold transition shadow-md hover:shadow-lg">
                                Purchase to Unlock
                            </button>
                        </div>
                    )}

                    {isOwner && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-center">
                                <p className="font-medium">✨ This is your asset</p>
                                <p className="text-sm mt-1 text-blue-600">You have full access to this content</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
