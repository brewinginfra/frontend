import { useState, useEffect, useRef } from 'react';
import { Search, Bell, MessageCircle, Settings, User, Wallet, X, Check, LogOut } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import { storage } from '../services/storage';
import { api, CreatorProfile } from '../services/api';

export function TopBar() {
  const [showSettings, setShowSettings] = useState(false);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Fetch profile when settings opens
  useEffect(() => {
    if (showSettings) {
      const creatorId = storage.getCreatorId();
      if (creatorId) {
        api.getCreatorProfile(creatorId)
          .then(data => {
            setProfile(data);
            setNewName(data.name);
          })
          .catch(err => {
            console.error('Failed to fetch profile:', err);
            setError('Failed to load profile');
          });
      }
    }
  }, [showSettings]);

  // Close settings when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
        setEditingName(false);
        setError(null);
        setSuccess(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateName = async () => {
    const creatorId = storage.getCreatorId();
    if (!creatorId || !newName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const updated = await api.updateCreatorProfile(creatorId, newName.trim());
      setProfile(updated);
      setEditingName(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError('Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearCreatorId();
    setProfile(null);
    setShowSettings(false);
    window.location.reload();
  };

  const isLoggedIn = !!storage.getCreatorId();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">ArbiFans</h1>
        </Link>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search creators..."
            className="bg-gray-100 border border-transparent rounded-full pl-10 pr-4 py-2 w-80 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 placeholder-gray-500 transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <ConnectButton showBalance={false} />
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-gray-900">
          <MessageCircle className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#12AAFF] rounded-full ring-2 ring-white"></span>
        </button>
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition text-gray-600 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Profile & Settings */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="relative group"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop"
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white shadow-sm hover:shadow-md transition group-hover:border-[#12AAFF]"
            />
            {isLoggedIn && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div
              className="absolute right-0 top-14 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              style={{
                animation: 'slideDown 0.2s ease-out',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#12AAFF] to-[#0088DD] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Account Settings</span>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-white/20 rounded-full transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {isLoggedIn ? (
                <div className="p-4 space-y-4">
                  {/* Success Message */}
                  {success && (
                    <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                      <Check className="w-4 h-4" />
                      Username updated successfully!
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Username Field */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User className="w-4 h-4 text-[#12AAFF]" />
                      Username
                    </label>
                    {editingName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#12AAFF] focus:bg-white transition"
                          placeholder="Enter new username"
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateName}
                          disabled={loading || !newName.trim()}
                          className="px-3 py-2 bg-[#12AAFF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                        >
                          {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setNewName(profile?.name || '');
                          }}
                          className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-900 font-medium">
                          {profile?.name || 'Loading...'}
                        </span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="text-xs text-[#12AAFF] hover:text-blue-600 font-medium transition"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Wallet Address Field (Read-only) */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Wallet className="w-4 h-4 text-[#12AAFF]" />
                      Wallet Address
                      <span className="text-xs text-gray-400 font-normal">(cannot be changed)</span>
                    </label>
                    <div className="bg-gray-100 rounded-lg px-3 py-2">
                      <span className="text-gray-600 font-mono text-xs break-all">
                        {profile?.walletAddress || 'Loading...'}
                      </span>
                    </div>
                  </div>

                  {/* Creator ID */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Creator ID</span>
                      <span className="font-mono font-bold text-blue-900">
                        #{profile?.id || storage.getCreatorId()}
                      </span>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 text-sm mb-4">
                    Sign in to access your profile settings
                  </p>
                  <Link
                    to="/"
                    onClick={() => setShowSettings(false)}
                    className="inline-block px-4 py-2 bg-[#12AAFF] text-white rounded-lg font-medium hover:bg-blue-600 transition"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
