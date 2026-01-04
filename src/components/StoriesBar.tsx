import { Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function StoriesBar() {
  const stories = [
    {
      id: 1,
      name: 'Your Story',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
      isYours: true,
    },
    {
      id: 2,
      name: 'Sophia',
      image: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=100&h=100&fit=crop',
      hasNew: true,
    },
    {
      id: 3,
      name: 'Emma',
      image: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=100&h=100&fit=crop',
      hasNew: true,
    },
    {
      id: 4,
      name: 'Olivia',
      image: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=100&h=100&fit=crop',
      hasNew: false,
    },
    {
      id: 5,
      name: 'Isabella',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
      hasNew: true,
    },
  ];

  return (
    <div className="border-b border-gray-800 px-6 py-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
            <div className={`relative p-[2px] rounded-full ${
              story.isYours ? 'bg-gray-700' : story.hasNew ? 'bg-gradient-to-tr from-blue-500 to-pink-500' : 'bg-gray-700'
            }`}>
              <div className="bg-black rounded-full p-[2px]">
                <ImageWithFallback
                  src={story.image}
                  alt={story.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
              {story.isYours && (
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                  <Plus className="w-3 h-3" />
                </div>
              )}
            </div>
            <span className="text-xs text-gray-400">{story.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
