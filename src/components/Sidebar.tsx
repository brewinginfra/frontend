import { Home, Compass, Bookmark, MessageCircle, DollarSign, BarChart3, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../services/storage';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Home', page: 'home' },
    { icon: Compass, label: 'Discover', page: 'discover' },
    { icon: MessageCircle, label: 'Messages', page: 'messages' },
    { icon: Bookmark, label: 'Bookmarks', page: 'bookmarks' },
    { icon: DollarSign, label: 'Creator Studio', page: 'register' },
    { icon: BarChart3, label: 'My Assets', page: 'my-assets' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] sticky top-16 px-4 py-6 flex flex-col overflow-y-auto">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActivePage(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activePage === item.page
              ? 'bg-[#12AAFF] text-white shadow-md'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-8 mb-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <h3 className="mb-2 font-semibold text-gray-900">Become a Creator</h3>
        <p className="text-sm text-gray-500 mb-3">
          Start earning from your content today
        </p>
        <button className="w-full bg-[#12AAFF] text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition shadow-sm font-medium">
          Get Started
        </button>
      </div>

      {/* <button
        onClick={() => {
          storage.clearCreatorId();
          navigate('/');
          window.location.reload();
        }}
        className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition"
      >
        <LogOut className="w-5 h-5" />
        <span>Log Out</span>
      </button> */}
    </aside>
  );
}