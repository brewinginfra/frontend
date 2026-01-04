import { useState, useEffect } from 'react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { CreatorProfile } from '../services/api';

export interface Conversation {
  id: number;
  name: string;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  isOnline: boolean;
  isVerified: boolean;
  walletAddress?: string;
}

interface ChatProps {
  initialCreator?: CreatorProfile | null;
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Sophia Rose',
    username: '@sophiarose',
    avatar: 'https://images.unsplash.com/photo-1619086303291-0ef7699e4b31?w=100&h=100&fit=crop',
    lastMessage: 'Hey! Thanks for subscribing 💕',
    timestamp: '2m ago',
    unread: 2,
    isOnline: true,
    isVerified: true,
  },
  {
    id: 2,
    name: 'Emma Fitness',
    username: '@emmafitness',
    avatar: 'https://images.unsplash.com/photo-1648748571003-98d6ff522019?w=100&h=100&fit=crop',
    lastMessage: 'Did you see my new workout video?',
    timestamp: '1h ago',
    unread: 0,
    isOnline: true,
    isVerified: true,
  },
  {
    id: 3,
    name: 'Olivia Grace',
    username: '@oliviagrace',
    avatar: 'https://images.unsplash.com/photo-1632613714614-e817d3814a8e?w=100&h=100&fit=crop',
    lastMessage: 'Check out my exclusive content!',
    timestamp: '3h ago',
    unread: 1,
    isOnline: false,
    isVerified: true,
  },
  {
    id: 4,
    name: 'Isabella Model',
    username: '@isabellamodel',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    lastMessage: 'Thank you so much! 😊',
    timestamp: '1d ago',
    unread: 0,
    isOnline: false,
    isVerified: true,
  },
  {
    id: 5,
    name: 'Mia Taylor',
    username: '@miataylor',
    avatar: 'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?w=100&h=100&fit=crop',
    lastMessage: 'Would love to hear your thoughts!',
    timestamp: '2d ago',
    unread: 0,
    isOnline: true,
    isVerified: true,
  },
];

export function Chat({ initialCreator }: ChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation>(conversations[0]);

  useEffect(() => {
    if (initialCreator) {
      // Check if conversation already exists
      const existingConv = conversations.find(c => c.name === initialCreator.name || (c.walletAddress && c.walletAddress === initialCreator.walletAddress));
      
      if (existingConv) {
        setActiveConversation(existingConv);
      } else {
        // Create new conversation
        const newConv: Conversation = {
          id: Date.now(),
          name: initialCreator.name,
          username: `@${initialCreator.name.replace(/\s+/g, '').toLowerCase()}`,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(initialCreator.name)}&background=random`,
          lastMessage: 'Start a conversation',
          timestamp: 'Just now',
          unread: 0,
          isOnline: true,
          isVerified: true,
          walletAddress: initialCreator.walletAddress
        };
        
        setConversations(prev => [newConv, ...prev]);
        setActiveConversation(newConv);
      }
    }
  }, [initialCreator]);

  return (
    <div className="flex h-[calc(100vh-4rem)] border-x border-gray-200 bg-white">
      <ConversationList
        conversations={conversations}
        activeConversation={activeConversation}
        setActiveConversation={setActiveConversation}
      />
      <MessageThread conversation={activeConversation} />
    </div>
  );
}
