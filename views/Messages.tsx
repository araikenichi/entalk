import React from 'react';
import { mockConversations } from '../constants';
import { Conversation, DirectMessage, User } from '../types';
import { ChevronLeftIcon, SearchIcon, SendIcon, ImageIcon, VideoIcon, XCircleIcon, PlayIcon } from '../components/Icons';
import { format } from 'date-fns';

interface MessagesProps {
  currentUser: User;
  onNavigateBack: () => void;
}

// --- Reusable Child Components ---

const ConversationListItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
}> = ({ conversation, isSelected, onSelect, currentUserId }) => {
  const otherUser = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    if (format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')) {
      return format(date, 'HH:mm');
    }
    return format(date, 'MMM d');
  };
  
  const lastMessageText = () => {
      if (lastMessage.media?.type === 'image') return 'Photo';
      if (lastMessage.media?.type === 'video') return 'Video';
      return lastMessage.text;
  }

  return (
    <div
      onClick={onSelect}
      className={`flex items-center p-3 cursor-pointer transition-colors duration-200 ${isSelected ? 'bg-blue-500/10 dark:bg-blue-500/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <div className="relative">
        <img src={otherUser.avatar} alt={otherUser.name} className="w-12 h-12 rounded-full" />
        {conversation.unreadCount && conversation.unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900"></span>
        )}
      </div>
      <div className="flex-1 ml-3">
        <div className="flex justify-between items-center">
          <p className="font-bold text-gray-800 dark:text-gray-100">{otherUser.name}</p>
          <p className="text-xs text-gray-500">{formatDate(lastMessage.timestamp)}</p>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
          {lastMessageText()}
        </p>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<{
  conversation: Conversation;
  onSendMessage: (text: string, media?: {type: 'image' | 'video', url: string}) => void;
  onBack: () => void;
  currentUser: User;
}> = ({ conversation, onSendMessage, onBack, currentUser }) => {
  const [newMessage, setNewMessage] = React.useState('');
  const [mediaToSend, setMediaToSend] = React.useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const otherUser = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [conversation.messages]);

  // Cleanup for object URLs
  React.useEffect(() => {
    return () => {
      if (mediaToSend) {
        URL.revokeObjectURL(mediaToSend.url);
      }
    };
  }, [mediaToSend]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0];
    if (file) {
      if (mediaToSend) {
        URL.revokeObjectURL(mediaToSend.url);
      }
      setMediaToSend({ url: URL.createObjectURL(file), type });
    }
    event.target.value = ''; // Reset file input
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() || mediaToSend) {
      // For mock, use a placeholder URL. In a real app, you'd upload and get a persistent URL.
      const mediaPayload = mediaToSend ? { type: mediaToSend.type, url: `https://picsum.photos/seed/new${Date.now()}/400/300` } : undefined;
      onSendMessage(newMessage.trim(), mediaPayload);
      setNewMessage('');
      if (mediaToSend) {
        URL.revokeObjectURL(mediaToSend.url);
      }
      setMediaToSend(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        <button onClick={onBack} className="md:hidden mr-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <ChevronLeftIcon />
        </button>
        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full" />
        <div className="ml-3 flex-1 min-w-0">
          <p className="font-bold truncate">{otherUser.name}</p>
          <p className="text-xs text-gray-500">@{otherUser.handle}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {conversation.messages.map(msg => (
             <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                {msg.senderId !== currentUser.id && <img src={otherUser.avatar} className="w-6 h-6 rounded-full self-end" alt="" />}
                <div
                    className={`max-w-[80%] sm:max-w-md rounded-2xl overflow-hidden shadow ${
                        msg.senderId === currentUser.id
                        ? 'bg-green-500 text-white rounded-br-lg'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-lg'
                    }`}
                >
                    {msg.media && (
                        msg.media.type === 'image'
                        ? <img src={msg.media.url} alt="chat media" className="w-full h-auto" />
                        : <div className="relative">
                            <video poster={msg.media.url} className="w-full h-auto bg-black" />
                            <div className="absolute inset-0 flex items-center justify-center">
                               <div className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                <PlayIcon />
                               </div>
                            </div>
                        </div>
                    )}
                    {msg.text && <p className="text-sm px-3 py-2 whitespace-pre-wrap">{msg.text}</p>}
                </div>
                {msg.senderId === currentUser.id && <img src={currentUser.avatar} className="w-6 h-6 rounded-full self-end" alt="" />}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
        {mediaToSend && (
            <div className="relative w-24 h-24 mb-2 p-1 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                <img src={mediaToSend.url} alt="preview" className="w-full h-full object-cover rounded" />
                <button 
                    onClick={() => { if(mediaToSend) URL.revokeObjectURL(mediaToSend.url); setMediaToSend(null); }} 
                    className="absolute -top-2 -right-2 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-600 rounded-full hover:scale-110 transition-transform"
                    aria-label="Remove media"
                >
                    <XCircleIcon />
                </button>
            </div>
        )}
        <form onSubmit={handleSend} className="flex items-center space-x-2">
           <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*" className="hidden" />
           <input type="file" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" className="hidden" />
           <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <ImageIcon />
           </button>
           <button type="button" onClick={() => videoInputRef.current?.click()} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors">
            <VideoIcon />
           </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors" disabled={!newMessage.trim() && !mediaToSend}>
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Main Messages View Component ---

const Messages: React.FC<MessagesProps> = ({ currentUser, onNavigateBack }) => {
  const [conversations, setConversations] = React.useState<Conversation[]>(() =>
    mockConversations.sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp || 0;
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp || 0;
        return lastMsgB - lastMsgA;
    })
  );
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Mark as read
    setConversations(prev => prev.map(c => c.id === id ? {...c, unreadCount: 0} : c))
  };

  const handleSendMessage = (text: string, media?: { type: 'image' | 'video', url: string }) => {
    if (!selectedConversationId) return;

    const newMessage: DirectMessage = {
      id: `dm${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
      ...(media && { media }),
    };

    const updatedConversations = conversations.map(c => {
      if (c.id === selectedConversationId) {
        return { ...c, messages: [...c.messages, newMessage] };
      }
      return c;
    }).sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp || 0;
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp || 0;
        return lastMsgB - lastMsgA;
    });

    setConversations(updatedConversations);
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  return (
    <div className="flex h-screen">
      {/* Conversation List Sidebar */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-800 flex-col h-full ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-4">
            <button onClick={onNavigateBack} className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search" className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <ConversationListItem
              key={conv.id}
              conversation={conv}
              isSelected={selectedConversationId === conv.id}
              onSelect={() => handleSelectConversation(conv.id)}
              currentUserId={currentUser.id}
            />
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`w-full md:w-2/3 lg:w-3/4 h-full ${selectedConversationId ? 'block' : 'hidden md:block'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversationId(null)}
            currentUser={currentUser}
          />
        ) : (
          <div className="h-full hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Select a conversation</h2>
              <p className="text-gray-500 mt-1">Choose from your existing conversations to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;