import React from 'react';
import { mockConversations } from '../constants';
import { Conversation, DirectMessage, User } from '../types';
import { ChevronLeftIcon, SearchIcon, SendIcon, ImageIcon, VideoIcon, XCircleIcon, PlayIcon } from '../../components/Icons';
import { format } from 'date-fns';
import { useTranslation } from '../../hooks/useTranslation';

interface MessagesProps {
  currentUser: User;
  onNavigateBack: () => void;
  targetUserId?: string; // 可选参数，用于直接打开与特定用户的对话
  onViewProfile?: (userId: string) => void; // 可选参数，用于跳转到用户个人资料页面
}

// --- Reusable Child Components ---

const ConversationListItem: React.FC<{
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
  onViewProfile?: (userId: string) => void;
}> = ({ conversation, isSelected, onSelect, currentUserId, onViewProfile }) => {
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
        <img 
          src={otherUser.avatar} 
          alt={otherUser.name} 
          className="w-12 h-12 rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡到父元素
            if (onViewProfile) {
              onViewProfile(otherUser.id);
            }
          }}
        />
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
  onViewProfile?: (userId: string) => void;
}> = ({ conversation, onSendMessage, onBack, currentUser, onViewProfile }) => {
  const { t } = useTranslation();
  const [newMessage, setNewMessage] = React.useState('');
  const [mediaToSend, setMediaToSend] = React.useState<{type: 'image' | 'video', url: string} | null>(null);
  const [showActionMenu, setShowActionMenu] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const videoStreamRef = React.useRef<MediaStream | null>(null);
  const otherUser = conversation.participants.find(p => p.id !== currentUser.id) || conversation.participants[0];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    };

    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionMenu]);

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

  // 拍照/录视频功能
  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      videoStreamRef.current = stream;
      
      // 创建video元素用于预览
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // 这里可以添加拍照/录视频的UI
      // 简化实现：直接录制5秒视频
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setMediaToSend({ type: 'video', url });
        stream.getTracks().forEach(track => track.stop());
        setIsCapturing(false);
      };
      
      mediaRecorder.start();
      setTimeout(() => {
        mediaRecorder.stop();
      }, 5000); // 录制5秒
      
    } catch (error) {
      console.error('无法访问摄像头:', error);
      alert('无法访问摄像头，请检查权限设置');
      setIsCapturing(false);
    }
  };

  // 语音录制功能 - 微信式长按录音
  const handleVoiceStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        // 自动发送语音消息
        console.log('语音录制完成，自动发送:', url);
        // 这里可以调用发送消息的函数
        // onSendMessage('', { type: 'audio', url });
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const handleVoiceEnd = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // 打电话功能
  const handlePhoneCall = () => {
    alert('正在发起语音通话...');
    // 这里可以集成WebRTC实现真实通话
  };

  // 视频通话功能
  const handleVideoCall = () => {
    alert('正在发起视频通话...');
    // 这里可以集成WebRTC实现真实视频通话
  };

  // 位置分享功能
  const handleLocationShare = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          alert(`位置已获取: ${latitude}, ${longitude}`);
          // 这里可以发送位置信息
        },
        (error) => {
          console.error('无法获取位置:', error);
          alert('无法获取位置，请检查权限设置');
        }
      );
    } else {
      alert('浏览器不支持地理定位');
    }
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
        <img 
          src={otherUser.avatar} 
          alt={otherUser.name} 
          className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => {
            if (onViewProfile) {
              onViewProfile(otherUser.id);
            }
          }}
        />
        <div className="ml-3 flex-1 min-w-0">
          <p className="font-bold truncate">{otherUser.name}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {conversation.messages.map(msg => (
             <div key={msg.id} className={`flex items-end gap-2 ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                {msg.senderId !== currentUser.id && <img src={otherUser.avatar} className="w-6 h-6 rounded-full self-end" alt="" />}
                <div
                    className={`max-w-[80%] sm:max-w-md rounded-2xl overflow-hidden shadow-sm ${
                        msg.senderId === currentUser.id
                        ? 'bg-green-500 text-gray-800 dark:text-gray-100 rounded-br-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-lg'
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

      {/* Input Area - Unified Design */}
      <div className="bg-white dark:bg-gray-800/50">
        {/* Media Preview */}
        {mediaToSend && (
            <div className="p-3 pb-0">
                <div className="relative w-24 h-24 p-1 border dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <img src={mediaToSend.url} alt="preview" className="w-full h-full object-cover rounded" />
                    <button 
                        onClick={() => { if(mediaToSend) URL.revokeObjectURL(mediaToSend.url); setMediaToSend(null); }} 
                        className="absolute -top-2 -right-2 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-600 rounded-full hover:scale-110 transition-transform"
                        aria-label="Remove media"
                    >
                        <XCircleIcon />
                    </button>
                </div>
            </div>
        )}
        

        
        {/* Input Form */}
        <div className="p-3">
          <form onSubmit={handleSend} className="flex items-center space-x-3 relative">
             <input type="file" ref={imageInputRef} onChange={(e) => handleFileSelect(e, 'image')} accept="image/*,video/*" className="hidden" />
             <input type="file" ref={videoInputRef} onChange={(e) => handleFileSelect(e, 'video')} accept="video/*" className="hidden" />
             <button 
               type="button" 
               onMouseDown={handleVoiceStart}
               onMouseUp={handleVoiceEnd}
               onMouseLeave={handleVoiceEnd}
               onTouchStart={handleVoiceStart}
               onTouchEnd={handleVoiceEnd}
               className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                 isRecording 
                   ? 'bg-red-500 text-white scale-110 animate-pulse shadow-lg shadow-red-500/50' 
                   : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
               }`}
             >
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                 <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                 <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                 <line x1="12" y1="19" x2="12" y2="23"></line>
                 <line x1="8" y1="23" x2="16" y2="23"></line>
               </svg>
               {isRecording && (
                 <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping"></div>
               )}
             </button>
             <input
               type="text"
               value={newMessage}
               onChange={(e) => setNewMessage(e.target.value)}
               placeholder={t('typeMessage')}
               className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
             />
             <div className="relative">
               <button 
                 type="button" 
                 onClick={() => setShowActionMenu(!showActionMenu)} 
                 className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
               >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <line x1="12" y1="5" x2="12" y2="19"></line>
                   <line x1="5" y1="12" x2="19" y2="12"></line>
                 </svg>
               </button>
             </div>
          </form>
         </div>
         
         {/* Action Menu - Below Input */}
         <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
           showActionMenu ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
         }`}>
           <div 
             ref={menuRef}
             className="px-4 py-3 border-t border-gray-100 dark:border-gray-700"
           >
             <div className="grid grid-cols-5 gap-6">
                <button 
                   type="button" 
                   onClick={() => { imageInputRef.current?.click(); setShowActionMenu(false); }}
                   className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                   <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                       <circle cx="8.5" cy="8.5" r="1.5"></circle>
                       <polyline points="21 15 16 10 5 21"></polyline>
                     </svg>
                   </div>
                   <span className="text-sm text-gray-700 dark:text-gray-300">{t('photo')}</span>
                 </button>
                <button 
                   type="button" 
                   onClick={() => { handleCapture(); setShowActionMenu(false); }}
                   className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                   disabled={isCapturing}
                 >
                   <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                     isCapturing ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600'
                   }`}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                       <circle cx="12" cy="13" r="4"></circle>
                     </svg>
                   </div>
                   <span className="text-sm text-gray-700 dark:text-gray-300">
                      {isCapturing ? t('recording') : t('capture')}
                    </span>
                 </button>
                <button 
                   type="button" 
                   onClick={() => { handleVideoCall(); setShowActionMenu(false); }}
                   className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                   <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <polygon points="23 7 16 12 23 17 23 7"></polygon>
                       <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                     </svg>
                   </div>
                   <span className="text-sm text-gray-700 dark:text-gray-300">{t('videoCall')}</span>
                 </button>
                <button 
                   type="button" 
                   onClick={() => { handleLocationShare(); setShowActionMenu(false); }}
                   className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                   <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                       <circle cx="12" cy="10" r="3"></circle>
                     </svg>
                   </div>
                   <span className="text-sm text-gray-700 dark:text-gray-300">{t('location')}</span>
                 </button>
                <button 
                   type="button" 
                   onClick={() => { handlePhoneCall(); setShowActionMenu(false); }}
                   className="flex flex-col items-center space-y-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                 >
                   <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                       <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                     </svg>
                   </div>
                   <span className="text-sm text-gray-700 dark:text-gray-300">{t('phoneCall')}</span>
                 </button>
             </div>
           </div>
         </div>
       </div>
     </div>
   );
};


// --- Main Messages View Component ---

const Messages: React.FC<MessagesProps> = ({ currentUser, onNavigateBack, targetUserId, onViewProfile }) => {
  const { t } = useTranslation();
  const [conversations, setConversations] = React.useState<Conversation[]>(() =>
    mockConversations.sort((a, b) => {
        const lastMsgA = a.messages[a.messages.length - 1]?.timestamp || 0;
        const lastMsgB = b.messages[b.messages.length - 1]?.timestamp || 0;
        return lastMsgB - lastMsgA;
    })
  );
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);

  // 如果有targetUserId，自动选择或创建与该用户的对话
  React.useEffect(() => {
    if (targetUserId) {
      // 查找是否已有与该用户的对话
      const existingConversation = conversations.find(conv => 
        conv.participants.some(p => p.id === targetUserId)
      );
      
      if (existingConversation) {
        setSelectedConversationId(existingConversation.id);
      } else {
        // 这里可以创建新对话的逻辑
        console.log('需要创建与用户', targetUserId, '的新对话');
      }
    }
  }, [targetUserId, conversations]);

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
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Conversation List Sidebar */}
      <div className={`w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-800 flex-col h-full bg-white dark:bg-gray-900 ${selectedConversationId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center mb-4">
            <button onClick={onNavigateBack} className="mr-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold">{t('messages')}</h1>
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
              onViewProfile={onViewProfile}
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
            onViewProfile={onViewProfile}
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