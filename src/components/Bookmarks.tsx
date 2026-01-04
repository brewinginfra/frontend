import { Bookmark, Heart, MessageCircle, Share2, Clock, Trash2, Grid3x3, List } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface BookmarkedPost {
    id: number;
    creator: {
        name: string;
        username: string;
        avatar: string;
    };
    content: {
        type: 'image' | 'video';
        thumbnail: string;
        caption: string;
    };
    stats: {
        likes: number;
        comments: number;
    };
    savedAt: string;
}

export function Bookmarks() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');

    const bookmarkedPosts: BookmarkedPost[] = [
        {
            id: 1,
            creator: {
                name: 'Sophia Rose',
                username: '@sophiarose',
                avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=200&fit=crop',
            },
            content: {
                type: 'image',
                thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop',
                caption: 'Summer vibes ☀️ New collection dropping soon!',
            },
            stats: {
                likes: 12543,
                comments: 892,
            },
            savedAt: '2 hours ago',
        },
        {
            id: 2,
            creator: {
                name: 'Emma Fitness',
                username: '@emmafitness',
                avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=200&h=200&fit=crop',
            },
            content: {
                type: 'video',
                thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop',
                caption: '30-min Full Body Workout 💪 No equipment needed!',
            },
            stats: {
                likes: 8234,
                comments: 456,
            },
            savedAt: '5 hours ago',
        },
        {
            id: 3,
            creator: {
                name: 'Olivia Grace',
                username: '@oliviagrace',
                avatar: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=200&h=200&fit=crop',
            },
            content: {
                type: 'image',
                thumbnail: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&h=500&fit=crop',
                caption: 'Healthy meal prep ideas for the week 🥗',
            },
            stats: {
                likes: 5643,
                comments: 234,
            },
            savedAt: '1 day ago',
        },
        {
            id: 4,
            creator: {
                name: 'Isabella Model',
                username: '@isabellamodel',
                avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
            },
            content: {
                type: 'image',
                thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=500&fit=crop',
                caption: 'Behind the scenes from today\'s photoshoot 📸',
            },
            stats: {
                likes: 15234,
                comments: 1243,
            },
            savedAt: '2 days ago',
        },
        {
            id: 5,
            creator: {
                name: 'Mia Taylor',
                username: '@miataylor',
                avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=200&fit=crop',
            },
            content: {
                type: 'video',
                thumbnail: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=500&fit=crop',
                caption: 'My morning routine for glowing skin ✨',
            },
            stats: {
                likes: 9876,
                comments: 567,
            },
            savedAt: '3 days ago',
        },
        {
            id: 6,
            creator: {
                name: 'Ava Johnson',
                username: '@avajohnson',
                avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=200&h=200&fit=crop',
            },
            content: {
                type: 'image',
                thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=500&fit=crop',
                caption: 'Fall fashion essentials you need 🍂',
            },
            stats: {
                likes: 11234,
                comments: 678,
            },
            savedAt: '4 days ago',
        },
    ];

    const filteredPosts = filterType === 'all'
        ? bookmarkedPosts
        : bookmarkedPosts.filter(post => post.content.type === filterType);

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl flex items-center gap-3">
                            <Bookmark className="w-8 h-8 text-pink-500" />
                            Bookmarks
                        </h1>
                        <p className="text-gray-400 mt-1">{filteredPosts.length} saved posts</p>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition ${viewMode === 'grid'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <Grid3x3 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition ${viewMode === 'list'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-full text-sm transition ${filterType === 'all'
                            ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        All Posts
                    </button>
                    <button
                        onClick={() => setFilterType('image')}
                        className={`px-4 py-2 rounded-full text-sm transition ${filterType === 'image'
                            ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Images
                    </button>
                    <button
                        onClick={() => setFilterType('video')}
                        className={`px-4 py-2 rounded-full text-sm transition ${filterType === 'video'
                            ? 'bg-gradient-to-r from-blue-600 to-pink-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                            }`}
                    >
                        Videos
                    </button>
                </div>
            </div>

            {/* Bookmarked Posts */}
            {filteredPosts.length === 0 ? (
                <div className="text-center py-20">
                    <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400 mb-2">No bookmarks found</h3>
                    <p className="text-gray-500">Start saving your favorite posts!</p>
                </div>
            ) : viewMode === 'grid' ? (
                <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: 0.08
                            }
                        }
                    }}
                >
                    {filteredPosts.map((post) => (
                        <motion.div
                            key={post.id}
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition group"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="relative aspect-[4/5]">
                                <img
                                    src={post.content.thumbnail}
                                    alt={post.content.caption}
                                    className="w-full h-full object-cover"
                                />
                                {post.content.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                                <button className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full backdrop-blur-sm transition opacity-0 group-hover:opacity-100">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>

                            <div className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src={post.creator.avatar}
                                        alt={post.creator.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm truncate">{post.creator.name}</div>
                                        <div className="text-xs text-gray-500 truncate">{post.creator.username}</div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{post.content.caption}</p>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {(post.stats.likes / 1000).toFixed(1)}K
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            {post.stats.comments}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {post.savedAt}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filteredPosts.map((post) => (
                        <div
                            key={post.id}
                            className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition flex gap-4 group"
                        >
                            <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={post.content.thumbnail}
                                    alt={post.content.caption}
                                    className="w-full h-full object-cover"
                                />
                                {post.content.type === 'video' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src={post.creator.avatar}
                                        alt={post.creator.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="truncate">{post.creator.name}</span>
                                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">{post.creator.username}</div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {post.savedAt}
                                    </div>
                                </div>

                                <p className="text-gray-300 mb-3 line-clamp-2">{post.content.caption}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {(post.stats.likes / 1000).toFixed(1)}K likes
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MessageCircle className="w-4 h-4" />
                                            {post.stats.comments} comments
                                        </span>
                                    </div>

                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                        <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-gray-800 hover:bg-red-600 rounded-lg transition">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
