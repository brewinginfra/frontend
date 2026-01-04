import { TrendingUp, Star, Flame } from 'lucide-react';
import { CategoryCard } from './CategoryCard';
import { CreatorCard } from './CreatorCard';

export function Discover() {
  const categories = [
    { id: 1, name: 'Fitness & Wellness', image: 'https://images.unsplash.com/photo-1611077094612-943a95a2708b?w=400&h=300&fit=crop', creators: 2341 },
    { id: 2, name: 'Fashion & Beauty', image: 'https://images.unsplash.com/photo-1594465919760-441fe5908ab0?w=400&h=300&fit=crop', creators: 3892 },
    { id: 3, name: 'Travel & Adventure', image: 'https://images.unsplash.com/photo-1528543606781-2f6e6857f318?w=400&h=300&fit=crop', creators: 1567 },
    { id: 4, name: 'Food & Cooking', image: 'https://images.unsplash.com/photo-1514986888952-8cd320577b68?w=400&h=300&fit=crop', creators: 1234 },
    { id: 5, name: 'Music & Entertainment', image: 'https://images.unsplash.com/photo-1575285113814-f770cb8c796e?w=400&h=300&fit=crop', creators: 2876 },
    { id: 6, name: 'Gaming & Tech', image: 'https://images.unsplash.com/photo-1660634435122-70ae113b1a87?w=400&h=300&fit=crop', creators: 1923 },
  ];

  const trendingCreators = [
    {
      id: 1,
      name: 'Sophia Rose',
      username: '@sophiarose',
      avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=400&h=200&fit=crop',
      subscribers: '45.2K',
      price: '$12.99',
      category: 'Fashion',
    },
    {
      id: 2,
      name: 'Emma Fitness',
      username: '@emmafitness',
      avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=400&h=200&fit=crop',
      subscribers: '62.8K',
      price: '$14.99',
      category: 'Fitness',
    },
    {
      id: 3,
      name: 'Olivia Grace',
      username: '@oliviagrace',
      avatar: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=400&h=200&fit=crop',
      subscribers: '38.5K',
      price: '$9.99',
      category: 'Lifestyle',
    },
    {
      id: 4,
      name: 'Isabella Model',
      username: '@isabellamodel',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop',
      coverImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=200&fit=crop',
      subscribers: '51.3K',
      price: '$19.99',
      category: 'Fashion',
    },
  ];

  const topEarners = [
    {
      id: 1,
      name: 'Mia Taylor',
      username: '@miataylor',
      avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=200&h=200&fit=crop',
      subscribers: '128K',
      earnings: '$2.4M',
    },
    {
      id: 2,
      name: 'Ava Johnson',
      username: '@avajohnson',
      avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=200&h=200&fit=crop',
      subscribers: '95K',
      earnings: '$1.8M',
    },
    {
      id: 3,
      name: 'Charlotte Smith',
      username: '@charlotte',
      avatar: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=200&h=200&fit=crop',
      subscribers: '87K',
      earnings: '$1.5M',
    },
  ];

  return (
    <div className="px-6 py-6">
      {/* Hero Section */}
      <div className="mb-8 bg-gradient-to-r from-blue-600/20 to-pink-600/20 rounded-2xl p-8 border border-blue-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-6 h-6 text-orange-500" />
          <h1 className="text-3xl">Discover Amazing Creators</h1>
        </div>
        <p className="text-gray-400">Explore trending content and find your new favorite creators</p>
      </div>

      {/* Categories */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2">
          <span>Browse by Category</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      {/* Trending Creators */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-pink-500" />
          <span>Trending Now</span>
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {trendingCreators.map((creator) => (
            <CreatorCard key={creator.id} creator={creator} />
          ))}
        </div>
      </section>

      {/* Top Earners */}
      <section>
        <h2 className="mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Top Earners This Month</span>
        </h2>
        <div className="space-y-3">
          {topEarners.map((earner, index) => (
            <div
              key={earner.id}
              className="bg-[#0f0f0f] border border-gray-800 rounded-lg p-4 flex items-center justify-between hover:border-gray-700 transition"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={earner.avatar}
                    alt={earner.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-600 to-pink-600 rounded-full flex items-center justify-center text-xs">
                    #{index + 1}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span>{earner.name}</span>
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-500">{earner.username}</div>
                  <div className="text-sm text-gray-400">{earner.subscribers} subscribers</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-500 text-xl">{earner.earnings}</div>
                <button className="mt-2 px-4 py-1 bg-gradient-to-r from-blue-600 to-pink-600 rounded-full text-sm hover:opacity-90 transition">
                  Subscribe
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
