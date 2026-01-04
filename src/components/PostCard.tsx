import { Heart, MessageCircle, Bookmark, MoreHorizontal, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Post {
  id: number;
  creator: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timeAgo: string;
  isLocked: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={post.creator.avatar}
            alt={post.creator.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{post.creator.name}</span>
              {post.creator.isVerified && (
                <svg className="w-4 h-4 text-[#12AAFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
            </div>
            <span className="text-sm text-gray-500">{post.creator.username}</span>
          </div>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <ImageWithFallback
          src={post.image}
          alt="Post"
          className={`w-full h-full object-cover ${post.isLocked ? 'blur-2xl' : ''}`}
        />
        {post.isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 backdrop-blur-md">
            <Lock className="w-16 h-16 text-gray-900 mb-4" />
            <p className="text-xl mb-2 font-bold text-gray-900">Subscribe to unlock</p>
            <button className="bg-[#12AAFF] text-white px-6 py-2 rounded-full hover:bg-blue-600 transition shadow-lg font-medium">
              Subscribe for $9.99/month
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 hover:text-pink-500 transition">
              <Heart className="w-6 h-6" />
              <span className="font-medium text-gray-900">{post.likes.toLocaleString()}</span>
            </button>
            <button className="flex items-center gap-2 hover:text-[#12AAFF] transition">
              <MessageCircle className="w-6 h-6" />
              <span className="font-medium text-gray-900">{post.comments}</span>
            </button>
          </div>
          <button className="hover:text-[#12AAFF] transition">
            <Bookmark className="w-6 h-6" />
          </button>
        </div>

        {/* Caption */}
        <div>
          <p className="text-gray-900">
            <span className="font-semibold mr-2">{post.creator.name}</span>
            <span className="text-gray-600">{post.caption}</span>
          </p>
          <span className="text-xs text-gray-400 uppercase tracking-wide mt-1 block">{post.timeAgo}</span>
        </div>

        {/* Comment Input */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <input
            type="text"
            placeholder="Add a comment..."
            className="flex-1 bg-transparent text-sm text-gray-900 focus:outline-none placeholder-gray-400"
          />
          <button className="text-[#12AAFF] font-medium hover:opacity-80 transition">Post</button>
        </div>
      </div>
    </div>
  );
}
