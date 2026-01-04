import { Search } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Conversation } from './Chat';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation;
  setActiveConversation: (conversation: Conversation) => void;
}

export function ConversationList({ conversations, activeConversation, setActiveConversation }: ConversationListProps) {
  return (
    <div className="w-96 border-r border-gray-200 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl mb-3 font-semibold text-gray-900">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full bg-gray-100 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 placeholder-gray-500 transition-all"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setActiveConversation(conversation)}
            className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 ${
              activeConversation.id === conversation.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="relative flex-shrink-0">
              <ImageWithFallback
                src={conversation.avatar}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black"></div>
              )}
            </div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <span className="truncate">{conversation.name}</span>
                  {conversation.isVerified && (
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-gray-500 flex-shrink-0">{conversation.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">{conversation.lastMessage}</p>
                {conversation.unread > 0 && (
                  <span className="flex-shrink-0 ml-2 w-5 h-5 bg-blue-500 rounded-full text-xs flex items-center justify-center">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
