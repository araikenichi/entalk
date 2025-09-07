import React, { useState, useEffect, useRef } from 'react';
import { Post, User } from '../types';
import { users } from '../constants';
import { geminiService } from '../services/geminiService';
import { StopIcon } from '../components/Icons';

interface LiveBroadcasterViewProps {
  post: Post;
  onEndStream: () => void;
}

interface ChatMessage {
  id: number;
  user: User;
  text: string;
  interpretation?: string;
}

const LiveBroadcasterView: React.FC<LiveBroadcasterViewProps> = ({ post, onEndStream }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInterpreterOn, setInterpreterOn] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [viewerCount, setViewerCount] = useState(post.viewers || 1);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    enableCamera();
    
    // Simulate viewers joining and chatting to make the experience feel alive
    const viewerInterval = setInterval(() => {
      setViewerCount(prev => prev + Math.floor(Math.random() * 5));
    }, 5000);
    
    const chatInterval = setInterval(async () => {
        const randomUser = Math.random() > 0.5 ? users.sato : users.chen;
        const randomText = Math.random() > 0.5 ? 'This is great! 素晴らしい！' : 'すごいですね！ What is this?';
        const incomingMessage: ChatMessage = {
            id: Date.now(),
            user: randomUser,
            text: randomText,
        };
        
        if (isInterpreterOn) {
            const interpretation = await geminiService.getLiveInterpretation(randomText);
            incomingMessage.interpretation = interpretation;
        }

        setChatMessages(prev => [...prev, incomingMessage]);
    }, 7000);


    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(viewerInterval);
      clearInterval(chatInterval);
    };
  }, [isInterpreterOn]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      user: post.user, // Broadcaster's message
      text: newMessage,
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    if (isInterpreterOn) {
      const interpretation = await geminiService.getLiveInterpretation(newMessage);
      setChatMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, interpretation } : msg
      ));
    }
    setNewMessage('');
  };


  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col md:flex-row">
        {/* Main Content: Video Player */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            
            <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                <div className="flex items-center bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold">LIVE</div>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-md text-sm">{viewerCount.toLocaleString()} watching</div>
            </div>
            
            <div className="absolute top-4 right-4 z-10">
                 <button onClick={onEndStream} className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors">
                    <StopIcon />
                    <span>End Stream</span>
                </button>
            </div>
            
            <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/60 to-transparent w-full">
                 <h2 className="font-bold text-lg drop-shadow-lg">{post.user.name}</h2>
                 <p className="text-gray-200 drop-shadow-lg">{post.content}</p>
            </div>
        </div>

        {/* Sidebar: Chat */}
        <div className="w-full md:w-80 bg-gray-900 bg-opacity-80 flex flex-col h-1/2 md:h-full">
             <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold">Live Chat</h3>
                <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">AI Interpreter</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isInterpreterOn} onChange={() => setInterpreterOn(!isInterpreterOn)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
            <div className="flex-1 p-3 overflow-y-auto">
                {chatMessages.map(msg => (
                    <div key={msg.id} className="flex items-start space-x-2 mb-3 text-sm">
                        <img src={msg.user.avatar} className="w-6 h-6 rounded-full mt-1" alt={msg.user.name} />
                        <div>
                            <p className="font-semibold text-gray-400">{msg.user.name}</p>
                            <p className="break-words">{msg.text}</p>
                            {msg.interpretation && (
                                <p className="text-blue-400 text-xs italic mt-1 break-words">{msg.interpretation}</p>
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
  );
};

export default LiveBroadcasterView;
