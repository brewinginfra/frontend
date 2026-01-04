import { Search, DollarSign, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { CreatorConversation } from './CreatorChat';

interface CreatorConversationListProps {
  conversations: CreatorConversation[];
  activeConversation: CreatorConversation;
  setActiveConversation: (conversation: CreatorConversation) => void;
  isLoading?: boolean;
}

export function CreatorConversationList({
  conversations,
  activeConversation,
  setActiveConversation,
  isLoading
}: CreatorConversationListProps) {
  const activeTips = conversations.filter(c => c.status === 'active');
  const expiredTips = conversations.filter(c => c.status === 'expired');

  const renderTipItem = (conversation: CreatorConversation) => (
    <button
      key={conversation.id}
      onClick={() => setActiveConversation(conversation)}
      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition border-b border-gray-100 ${activeConversation?.id === conversation.id ? 'bg-blue-50' : ''
        }`}
    >
      <div className="relative flex-shrink-0">
        <ImageWithFallback
          src={conversation.avatar}
          alt={conversation.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        {conversation.isOnline && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="truncate font-medium text-gray-900 text-sm">{conversation.name}</span>
          <span className={`text-xs flex-shrink-0 flex items-center gap-1 ${conversation.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
             <Clock className="w-3 h-3" />
             {conversation.timestamp}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full">
            <DollarSign className="w-3 h-3 text-green-600" />
            <span className="text-xs text-green-700 font-medium">{conversation.totalTips} mUSDT</span>
          </div>
          <span className="text-xs text-gray-400">
             {conversation.status === 'active' ? 'Claimable' : 'Unclaimed'}
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col bg-white h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips & Escrow</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-gray-100 border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading tips...</div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No tips found</div>
        ) : (
          <>
            {/* Active / Claimable Section */}
            {activeTips.length > 0 && (
               <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 border-y border-gray-100 z-10">
                    Active / Claimable ({activeTips.length})
                  </div>
                  {activeTips.map(renderTipItem)}
               </div>
            )}

            {/* Expired / Unclaimed Section */}
            {expiredTips.length > 0 && (
               <div>
                  <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 border-y border-gray-100 z-10">
                    Expired / Unclaimed ({expiredTips.length})
                  </div>
                  {expiredTips.map(renderTipItem)}
               </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}