import { ImageWithFallback } from './figma/ImageWithFallback';

export function SuggestionsPanel() {
  const suggestions = [
    {
      id: 1,
      name: 'Jessica Lee',
      username: '@jessicalee',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
      subscribers: '12.5K',
      price: '$12.99',
    },
    {
      id: 2,
      name: 'Mia Taylor',
      username: '@miataylor',
      avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=100&h=100&fit=crop',
      subscribers: '8.3K',
      price: '$9.99',
    },
    {
      id: 3,
      name: 'Ava Johnson',
      username: '@avajohnson',
      avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=100&h=100&fit=crop',
      subscribers: '15.2K',
      price: '$14.99',
    },
    {
      id: 4,
      name: 'Charlotte Smith',
      username: '@charlotte',
      avatar: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=100&h=100&fit=crop',
      subscribers: '20.1K',
      price: '$19.99',
    },
  ];

  return (
    <aside className="w-80 bg-white border-l border-gray-200 min-h-screen sticky top-16 px-6 py-6 hidden lg:block">
      <div className="mb-6">
        <h2 className="mb-4 text-gray-900 font-semibold">Suggested Creators</h2>
        <div className="space-y-4">
          {suggestions.map((creator) => (
            <div key={creator.id} className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={creator.avatar}
                  alt={creator.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100"
                />
                <div>
                  <div className="font-medium text-gray-900">{creator.name}</div>
                  <div className="text-sm text-gray-500">{creator.username}</div>
                  <div className="text-xs text-gray-500">{creator.subscribers} subscribers</div>
                </div>
              </div>
              <button className="text-sm text-[#12AAFF] hover:text-blue-700 transition whitespace-nowrap font-medium">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-gradient-to-br from-pink-600/20 to-purple-600/20 rounded-lg border border-pink-500/30">
        <h3 className="mb-2">Premium Features</h3>
        <ul className="text-sm text-gray-400 space-y-2 mb-3">
          <li>• Unlock exclusive content</li>
          <li>• Direct messaging</li>
          <li>• Custom requests</li>
          <li>• Ad-free experience</li>
        </ul>
        <button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
