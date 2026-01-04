import { useState, useEffect } from 'react';
import { FeedCard } from './FeedCard';
import { api, Asset, CreatorProfile } from '../services/api';
import { storage } from '../services/storage';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';

interface AssetWithCreator extends Asset {
  creatorName?: string;
}

export function Feed() {
  const [assets, setAssets] = useState<AssetWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCreatorId, setCurrentCreatorId] = useState<number | null>(null);

  useEffect(() => {
    loadAssets();
    const storedId = storage.getCreatorId();
    setCurrentCreatorId(storedId ? Number(storedId) : null);
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAssets();

      // Fetch creator names for each unique creator
      const uniqueCreatorIds = [...new Set(data.map(a => a.creatorId))];
      const creatorProfiles: Record<number, CreatorProfile> = {};

      // Fetch all creator profiles in parallel
      await Promise.all(
        uniqueCreatorIds.map(async (creatorId) => {
          try {
            const profile = await api.getCreatorProfile(creatorId);
            creatorProfiles[creatorId] = profile;
          } catch (err) {
            // If we can't fetch the profile, we'll just use the ID
            console.log(`Could not fetch profile for creator ${creatorId}`);
          }
        })
      );

      // Map assets with creator names
      const assetsWithCreators: AssetWithCreator[] = data.map(asset => ({
        ...asset,
        creatorName: creatorProfiles[asset.creatorId]?.name
      }));

      setAssets(assetsWithCreators);
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-[#12AAFF] animate-spin" />
        <p className="text-gray-500 text-sm">Loading your feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={loadAssets}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg transition text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 px-6">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 mb-1">No posts yet</h3>
          <p className="text-gray-500 text-sm">Be the first to share something amazing!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="px-6 py-6 space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Feed</h2>
        <button
          onClick={loadAssets}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-700"
          title="Refresh feed"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Assets as Feed Cards */}
      {assets.map((asset) => {
        const isOwner = currentCreatorId === asset.creatorId;

        return (
          <motion.div key={asset.id} variants={itemVariants}>
            <FeedCard
              asset={asset}
              creatorName={asset.creatorName}
              isOwner={isOwner}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('route-asset-detail', { detail: asset.id }));
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
