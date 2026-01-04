import { ImageWithFallback } from './figma/ImageWithFallback';

interface Creator {
  id: number;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  subscribers: string;
  price: string;
  category: string;
}

interface CreatorCardProps {
  creator: Creator;
}

export function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
      {/* Cover Image */}
      <div className="relative h-24 overflow-hidden">
        <ImageWithFallback
          src={creator.coverImage}
          alt={creator.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
          {creator.category}
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <ImageWithFallback
            src={creator.avatar}
            alt={creator.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-800 -mt-8"
          />
          <div className="flex-1 mt-1">
            <div className="flex items-center gap-1">
              <h3 className="text-sm">{creator.name}</h3>
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
            </div>
            <p className="text-xs text-gray-500">{creator.username}</p>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-gray-400">{creator.subscribers} subscribers</span>
          <span className="text-blue-400">{creator.price}/mo</span>
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-pink-600 text-white py-2 rounded-lg hover:opacity-90 transition">
          Subscribe
        </button>
      </div>
    </div>
  );
}
