import { useState } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Asset } from '../services/api';

interface FeedCardProps {
    asset: Asset;
    creatorName?: string;
    isOwner?: boolean;
    onClick?: () => void;
}

export function FeedCard({ asset, creatorName, isOwner = false, onClick }: FeedCardProps) {
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 2000) + 100);
    const [comment, setComment] = useState('');

    const isUnlocked = asset.unlockableContent === true;
    const shouldBlur = !isOwner && !isUnlocked;

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

    return (
        <div
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            onClick={onClick}
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            {/* Header Section */}
            <div className="flex items-center justify-between p-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#12AAFF] to-[#0088DD] flex items-center justify-center text-white font-bold text-sm ring-2 ring-gray-100 flex-shrink-0">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-gray-900 text-sm truncate">{displayName}</span>
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
                        paddingBottom: '100%', /* 1:1 Aspect Ratio */
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
                                className={`w-full h-full object-cover ${shouldBlur ? 'blur-xl' : ''}`}
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
                        {shouldBlur && (
                            <div
                                className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm"
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
                                <p className="text-white font-semibold mb-2">Exclusive Content</p>
                                <button
                                    className="bg-[#12AAFF] text-white px-6 py-2 rounded-full hover:bg-blue-600 transition shadow-lg font-medium text-sm"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Unlock for {asset.price} ETH
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
    );
}
