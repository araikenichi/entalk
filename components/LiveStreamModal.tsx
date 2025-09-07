
import React, { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { users } from '../constants';
import { geminiService } from '../services/geminiService';

interface LiveStreamModalProps {
  post: Post;
  onClose: () => void;
}

interface ChatMessage {
  id: number;
  user: { name: string; avatar: string };
  text: string;
  interpretation?: string;
}

const LiveStreamModal: React.FC<LiveStreamModalProps> = ({ post, onClose }) => {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isInterpreterOn, setInterpreterOn] = useState(true);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      user: users.emily, // Simulate current user
      text: newMessage,
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    if (isInterpreterOn) {
      const interpretation = await geminiService.getLiveInterpretation(newMessage);
      setChatMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, interpretation } : msg
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 text-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <div className="flex items-center space-x-3">
                 <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full" />
                 <div>
                    <p className="font-bold">{post.user.name}</p>
                    <p className="text-sm text-gray-400">{post.viewers?.toLocaleString()} watching</p>
                 </div>
            </div>
            <button onClick={onClose} className="text-white text-2xl">&times;</button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Video Player */}
            <div className="flex-1 bg-black flex items-center justify-center relative">
                <img src={post.media?.[0].url} className="max-h-full max-w-full" alt="live stream"/>
                 <div className="absolute top-3 left-3 flex items-center bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold">LIVE</div>
            </div>

            {/* Chat */}
            <div className="w-full md:w-80 bg-gray-800 flex flex-col">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-bold">Live Chat</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-400">AI Interpreter</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isInterpreterOn} onChange={() => setInterpreterOn(!isInterpreterOn)} className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
                <div className="flex-1 p-3 overflow-y-auto">
                    {chatMessages.map(msg => (
                        <div key={msg.id} className="flex items-start space-x-2 mb-3 text-sm">
                            <img src={msg.user.avatar} className="w-6 h-6 rounded-full mt-1" alt={msg.user.name} />
                            <div>
                                <p className="font-semibold text-gray-400">{msg.user.name}</p>
                                <p>{msg.text}</p>
                                {msg.interpretation && (
                                    <p className="text-blue-400 text-xs italic mt-1">{msg.interpretation}</p>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
                    <input 
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Say something..."
                        className="w-full bg-gray-700 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamModal;

