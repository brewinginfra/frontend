import { useState } from 'react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';

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
}

export function Chat() {
  const conversations: Conversation[] = [
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

  const [activeConversation, setActiveConversation] = useState<Conversation>(conversations[0]);

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
