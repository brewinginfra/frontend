import { useState } from 'react';
import { MoreVertical, Phone, Video, Send, Image, Smile, DollarSign } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Conversation } from './Chat';

interface Message {
  id: number;
  sender: 'me' | 'them';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'tip';
  amount?: string;
}

interface MessageThreadProps {
  conversation: Conversation;
}

export function MessageThread({ conversation }: MessageThreadProps) {
  const [messageText, setMessageText] = useState('');

  const messages: Message[] = [
    {
      id: 1,
      sender: 'them',
      content: 'Hey! Thanks so much for subscribing! 💕',
      timestamp: '10:30 AM',
      type: 'text',
    },
    {
      id: 2,
      sender: 'me',
      content: 'Love your content! Keep it up!',
      timestamp: '10:32 AM',
      type: 'text',
    },
    {
      id: 3,
      sender: 'them',
      content: 'That means so much to me! 😊',
      timestamp: '10:33 AM',
      type: 'text',
    },
    {
      id: 4,
      sender: 'me',
      content: '$20',
      timestamp: '10:35 AM',
      type: 'tip',
      amount: '$20.00',
    },
    {
      id: 5,
      sender: 'them',
      content: 'OMG thank you so much!! 🥰 You\'re the best!',
      timestamp: '10:36 AM',
      type: 'text',
    },
    {
      id: 6,
      sender: 'them',
      content: 'Check out my new photo set I just posted!',
      timestamp: '10:38 AM',
      type: 'text',
    },
  ];

  const handleSend = () => {
    if (messageText.trim()) {
      // Handle send message
      setMessageText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ImageWithFallback
              src={conversation.avatar}
              alt={conversation.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{conversation.name}</span>
              {conversation.isVerified && (
                <svg className="w-4 h-4 text-[#12AAFF]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              )}
            </div>
            <span className="text-xs text-green-500 font-medium">
              {conversation.isOnline ? 'Active now' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500 hover:text-gray-900">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs ${message.sender === 'me' ? 'order-2' : 'order-1'}`}>
              {message.type === 'text' && (
                <div
                  className={`px-4 py-2 rounded-2xl shadow-sm ${
                    message.sender === 'me'
                      ? 'bg-[#12AAFF] text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p>{message.content}</p>
                </div>
              )}
              {message.type === 'tip' && (
                <div className="bg-orange-50 border border-orange-100 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-orange-500" />
                    <span className="text-orange-600 font-medium">Tip sent</span>
                  </div>
                  <p className="text-xl text-orange-500 font-bold">{message.amount}</p>
                </div>
              )}
              <span className="text-xs text-gray-400 mt-1 block px-2 text-right">{message.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-orange-700 font-medium">Unlock messaging with a tip</span>
          </div>
          <p className="text-xs text-gray-500 mb-3">Send a tip to start the conversation</p>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-medium">
              $5
            </button>
            <button className="flex-1 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-medium">
              $10
            </button>
            <button className="flex-1 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-medium">
              $20
            </button>
            <button className="flex-1 py-2 bg-white border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 transition text-sm font-medium">
              Custom
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <Image className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400 hover:text-gray-600">
            <Smile className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message and send with a tip..."
            className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2 text-sm text-gray-900 focus:outline-none focus:bg-white focus:border-blue-500 placeholder-gray-500 transition-all"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-[#12AAFF] text-white rounded-full hover:bg-blue-600 transition flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-bold">Tip & Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}