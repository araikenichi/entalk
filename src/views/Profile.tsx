import React, { useState, useEffect, useRef } from 'react';
import { User, Post, PostType } from '../types';
import PostCard from '../../components/PostCard';
import { ChevronLeftIcon, CheckIcon, CameraIcon, LogOutIcon, PlusIcon, MessagesIcon, SettingsIcon } from '../../components/Icons';
import { useTranslation } from '../../hooks/useTranslation';

interface ProfileProps {
  user: User;
  currentUser: User;
  posts: Post[];
  currentUserId: string;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onBack: () => void;
  onUpdateProfile: (updatedData: Partial<User>) => void;
  onLogout: () => void;
  onStartMessage?: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  currentUser,
  posts,
  currentUserId,
  followedUserIds,
  onFollowToggle,
  onViewProfile,
  onBack,
  onUpdateProfile,
  onLogout,
  onStartMessage
}) => {
  const { t, locale, setLocale } = useTranslation();
  
  // 同步语言设置状态
  useEffect(() => {
    setSelectedLanguage(locale);
  }, [locale]);
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [isFollowAnimating, setIsFollowAnimating] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localFollowerCount, setLocalFollowerCount] = useState(user.followerCount);
  const [localFollowingCount, setLocalFollowingCount] = useState(user.followingCount);
  const [isMessageAnimating, setIsMessageAnimating] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValues, setTempValues] = useState({
    name: user.name,
    handle: user.handle,
    email: user.email || '',
    password: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    push: true,
    likes: true,
    comments: true,
    follows: true
  });
  const [privacySettings, setPrivacySettings] = useState({
    privateAccount: false
  });
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  
  const languages = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' }
  ];
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditedUser(user);
    if(user.id !== currentUserId) {
        setIsEditing(false);
    }
  }, [user, currentUserId]);

  useEffect(() => {
    const handleScroll = () => {
      if (profileRef.current) {
        const scrollTop = window.scrollY;
        const threshold = 200; // 滚动200px后显示用户信息
        setShowUserInfo(scrollTop > threshold);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const newImageUrl = URL.createObjectURL(file);
      setEditedUser(prev => {
        // Revoke the old blob URL if it exists to prevent memory leaks
        const oldUrl = prev[type];
        if (oldUrl.startsWith('blob:')) {
          URL.revokeObjectURL(oldUrl);
        }
        return { ...prev, [type]: newImageUrl };
      });
    }
    e.target.value = ''; // Allow re-selecting the same file
  };

  const handleSave = () => {
    onUpdateProfile(editedUser);
    setIsEditing(false);
  };

  const handleSettingsSave = (field: string, value: string) => {
    const updatedData: Partial<User> = {};
    if (field === 'name') updatedData.name = value;
    if (field === 'handle') updatedData.handle = value;
    if (field === 'email') updatedData.email = value;
    
    onUpdateProfile(updatedData);
    setEditingField(null);
  };

  const handleNotificationToggle = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleCancel = () => {
    // Revoke any temporary blob URLs created during editing
    if (editedUser.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(editedUser.avatar);
    }
    if (editedUser.coverImage.startsWith('blob:')) {
      URL.revokeObjectURL(editedUser.coverImage);
    }
    setEditedUser(user); // Revert to original user data
    setIsEditing(false);
  };


  const userPosts = posts.filter(p => p.user.id === user.id);
  const mediaPosts = userPosts.filter(p => p.type === PostType.Video || p.type === PostType.Live || p.wasLive);
  
  const isCurrentUser = user.id === currentUserId;
  const isFollowed = followedUserIds.includes(user.id);

  const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="text-center">
      <p className="font-bold text-lg">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
  
  const displayUser = isEditing ? editedUser : user;

  return (
    <div ref={profileRef} className="bg-white dark:bg-black min-h-screen">
      {/* Hidden file inputs for image uploads */}
      <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleImageFileSelect(e, 'avatar')} className="hidden" />
      <input type="file" accept="image/*" ref={coverImageInputRef} onChange={(e) => handleImageFileSelect(e, 'coverImage')} className="hidden" />

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 flex items-center justify-between">
         <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
           <ChevronLeftIcon />
         </button>
         <div className={`transition-all duration-500 ease-in-out transform ${
           showUserInfo 
             ? 'opacity-100 translate-x-0' 
             : 'opacity-0 -translate-x-4 pointer-events-none'
         }`}>
            <h1 className="text-xl font-bold">{displayUser.name}</h1>
         </div>
         <div className="p-2">
           <div className="w-6 h-6 flex items-center justify-center">
             <div className="text-gray-600">⋯</div>
           </div>
         </div>
      </div>

      {/* Cover Image */}
      <div className="relative">
        <img src={displayUser.coverImage} alt="Cover" className="w-full h-48 object-cover" />
        {isEditing && (
           <button onClick={() => coverImageInputRef.current?.click()} className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors">
             <CameraIcon className="w-5 h-5" />
           </button>
        )}
        
        {/* Avatar positioned over cover */}
        <div className="absolute -bottom-10 left-4">
          <div className="relative">
             <img src={displayUser.avatar} alt={displayUser.name} className="w-20 h-20 rounded-full border-2 border-white object-cover" />
             {isEditing && (
                <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-75 transition-colors">
                   <CameraIcon className="w-4 h-4" />
                </button>
             )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="px-4 pt-14 pb-4">
        {/* User Info below cover image */}
        <div className={`mb-6 transition-all duration-500 ease-in-out transform ${
          !showUserInfo 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold mb-1">{displayUser.name}</h1>
              <p className="text-sm text-gray-500">ID：{displayUser.handle}</p>
            </div>
            
            {/* Action Buttons next to name */}
            <div className="flex space-x-2">
              {isCurrentUser ? (
                <>
                  <button onClick={() => setShowSettings(true)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm flex items-center justify-center">
                      <SettingsIcon className="w-4 h-4" />
                  </button>

                  <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm">
                      {t('editProfile')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                      onClick={() => {
                        setIsMessageAnimating(true);
                        setTimeout(() => {
                          setIsMessageAnimating(false);
                          if (onStartMessage) {
                            onStartMessage(user.id);
                          }
                        }, 200);
                      }}
                      className={`px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 ease-in-out font-medium text-sm flex items-center justify-center ${
                        isMessageAnimating 
                          ? 'transform scale-110 shadow-lg bg-blue-100 dark:bg-blue-900/50' 
                          : 'transform scale-100 shadow-sm'
                      }`}
                      style={{
                        opacity: isMessageAnimating ? 0.9 : 1,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                   >
                      <MessagesIcon className={`w-4 h-4 transition-transform duration-300 ${
                        isMessageAnimating ? 'scale-110' : 'scale-100'
                      }`} />
                    </button>
                   {isFollowed ? (
                     <button 
                        onClick={() => {
                          setIsFollowAnimating(true);
                          setTimeout(() => setIsFollowAnimating(false), 300);
                          // 更新本地关注者数量
                          setLocalFollowerCount(prev => prev - 1);
                          onFollowToggle(user.id);
                        }} 
                        className={`px-4 py-1.5 rounded-full transition-all duration-300 ease-in-out border-2 bg-blue-500 text-white hover:bg-blue-600 border-blue-500 font-medium text-sm ${
                          isFollowAnimating ? 'transform scale-110 shadow-lg' : 'transform scale-100 shadow-sm'
                        }`}
                        style={{
                          opacity: isFollowAnimating ? 0.8 : 1,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        {t('following')}
                      </button>
                    ) : (
                      <button 
                         onClick={() => {
                           setIsFollowAnimating(true);
                           setTimeout(() => setIsFollowAnimating(false), 300);
                           // 更新本地关注者数量
                           setLocalFollowerCount(prev => prev + 1);
                           onFollowToggle(user.id);
                         }} 
                         className={`px-4 py-1.5 rounded-full transition-all duration-300 ease-in-out border-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 border-transparent font-medium text-sm ${
                           isFollowAnimating ? 'transform scale-110 shadow-lg' : 'transform scale-100 shadow-sm'
                         }`}
                         style={{
                           opacity: isFollowAnimating ? 0.8 : 1,
                           transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                         }}
                       >
                         {t('follow')}
                       </button>
                    )}
                </>
              )}
            </div>
          </div>
        </div>

        {isEditing ? (
            <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">{t('name')}</label>
                    <input name="name" value={editedUser.name} onChange={handleInputChange} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1"/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">{t('bio')}</label>
                    <textarea name="bio" value={editedUser.bio} onChange={handleInputChange} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1" rows={3}/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">{t('jobTitle')}</label>
                    <input name="jobTitle" value={editedUser.jobTitle} onChange={handleInputChange} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1"/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300">{t('location')}</label>
                    <input name="location" value={editedUser.location} onChange={handleInputChange} className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1"/>
                 </div>
                 <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={handleCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        {t('cancel')}
                    </button>
                     <button onClick={handleSave} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-semibold">
                        {t('save')}
                    </button>
                </div>
            </div>
        ) : (
            <>
                {/* Bio */}
                   <div className="mb-4">
                     <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{displayUser.bio}</p>
                   </div>
                   
                   {/* Stats - Small version below bio */}
                   <div className="flex space-x-6 mb-6">
                     <div>
                       <p className="font-semibold text-sm">{localFollowerCount}</p>
                       <p className="text-xs text-gray-500">{t('followers')}</p>
                     </div>
                     <div>
                       <p className="font-semibold text-sm">{localFollowingCount}</p>
                       <p className="text-xs text-gray-500">{t('following')}</p>
                     </div>
                   </div>
             </>
        )}
      </div>
      


      {/* Content Tabs */}
      <div>
        <div className="relative flex border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 p-4 font-semibold text-center transition-colors duration-300 ease-out ${
              activeTab === 'posts' ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
              {t('posts')}
            </button>
            <button onClick={() => setActiveTab('media')} className={`flex-1 p-4 font-semibold text-center transition-colors duration-300 ease-out ${
              activeTab === 'media' ? 'text-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}>
              {t('videoLive')}
            </button>
          {/* 滑动指示器 */}
           <div 
             className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-500 ease-out"
             style={{
               width: '30%',
               left: activeTab === 'posts' ? '10%' : '60%'
             }}
           />
        </div>
        <div>
            {activeTab === 'posts' && (
                userPosts.length > 0 ? (
                    userPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onUpdatePost={() => {}} 
                            onDeletePost={() => {}}
                            currentUserId={currentUserId}
                            currentUser={currentUser}
                            isFollowed={followedUserIds.includes(post.user.id)}
                            onFollowToggle={onFollowToggle}
                            onViewProfile={onViewProfile}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 p-8">No posts yet.</p>
                )
            )}
            {activeTab === 'media' && (
                 mediaPosts.length > 0 ? (
                    mediaPosts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post} 
                            onUpdatePost={() => {}} 
                            onDeletePost={() => {}}
                            currentUserId={currentUserId}
                            currentUser={currentUser}
                            isFollowed={followedUserIds.includes(post.user.id)}
                            onFollowToggle={onFollowToggle}
                            onViewProfile={onViewProfile}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 p-8">No videos or live replays yet.</p>
                )
            )}
        </div>
      </div>
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
               <h2 className="text-lg font-bold">{t('settings')}</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Account Settings */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('accountSettings')}</h3>
                 <div className="space-y-2">
                  {editingField === 'handle' ? (
                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                       <div className="flex items-center space-x-2">
                         <input
                           type="text"
                           value={tempValues.handle}
                           onChange={(e) => setTempValues(prev => ({ ...prev, handle: e.target.value }))}
                           className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder={t('enterNewId')}
                         />
                         <button
                           onClick={() => handleSettingsSave('handle', tempValues.handle)}
                           className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                         >
                             {t('save')}
                           </button>
                           <button
                             onClick={() => setEditingField(null)}
                             className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                           >
                             {t('cancel')}
                           </button>
                       </div>
                     </div>
                   ) : (
                     <button onClick={() => setEditingField('handle')} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                       <div className="flex items-center justify-between">
                          <span>{t('changeId')}</span>
                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </div>
                     </button>
                   )}
                  {editingField === 'email' ? (
                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                       <div className="flex items-center space-x-2">
                         <input
                           type="email"
                           value={tempValues.email}
                           onChange={(e) => setTempValues(prev => ({ ...prev, email: e.target.value }))}
                           className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="输入新邮箱"
                         />
                         <button
                           onClick={() => handleSettingsSave('email', tempValues.email)}
                           className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                         >
                           保存
                         </button>
                         <button
                           onClick={() => setEditingField(null)}
                           className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                         >
                           取消
                         </button>
                       </div>
                     </div>
                   ) : (
                     <button onClick={() => setEditingField('email')} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                       <div className="flex items-center justify-between">
                         <span>修改邮箱</span>
                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </div>
                     </button>
                   )}
                  {editingField === 'password' ? (
                     <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                       <div className="space-y-2">
                         <input
                           type="password"
                           value={tempValues.password}
                           onChange={(e) => setTempValues(prev => ({ ...prev, password: e.target.value }))}
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                           placeholder="输入新密码"
                         />
                         <div className="flex items-center space-x-2">
                           <button
                             onClick={() => {
                               if (tempValues.password.length >= 6) {
                                 handleSettingsSave('password', tempValues.password);
                                 setTempValues(prev => ({ ...prev, password: '' }));
                               }
                             }}
                             disabled={tempValues.password.length < 6}
                             className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                           >
                             保存
                           </button>
                           <button
                             onClick={() => {
                               setEditingField(null);
                               setTempValues(prev => ({ ...prev, password: '' }));
                             }}
                             className="px-3 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                           >
                             取消
                           </button>
                         </div>
                         {tempValues.password.length > 0 && tempValues.password.length < 6 && (
                           <p className="text-sm text-red-500">密码至少需要6个字符</p>
                         )}
                       </div>
                     </div>
                   ) : (
                     <button onClick={() => setEditingField('password')} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                       <div className="flex items-center justify-between">
                         <span>修改密码</span>
                         <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                         </svg>
                       </div>
                     </button>
                   )}
                </div>
              </div>
              
              {/* Privacy Settings */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('privacySettings')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <span>{t('privateAccount')}</span>
                     <button
                       onClick={() => handlePrivacyToggle('privateAccount')}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                         privacySettings.privateAccount ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                       }`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                         privacySettings.privateAccount ? 'right-0.5' : 'left-0.5'
                       }`}></div>
                     </button>
                   </div>
                  <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <span>屏蔽用户</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <span>谁可以给我发消息</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('notificationSettings')}</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <span>{t('pushNotifications')}</span>
                     <button
                       onClick={() => handleNotificationToggle('push')}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                         notificationSettings.push ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                       }`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                         notificationSettings.push ? 'right-0.5' : 'left-0.5'
                       }`}></div>
                     </button>
                   </div>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <span>{t('likeNotifications')}</span>
                     <button
                       onClick={() => handleNotificationToggle('likes')}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                         notificationSettings.likes ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                       }`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                         notificationSettings.likes ? 'right-0.5' : 'left-0.5'
                       }`}></div>
                     </button>
                   </div>
                   <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <span>{t('commentNotifications')}</span>
                     <button
                       onClick={() => handleNotificationToggle('comments')}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                         notificationSettings.comments ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                       }`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                         notificationSettings.comments ? 'right-0.5' : 'left-0.5'
                       }`}></div>
                     </button>
                   </div>
                   <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <span>{t('followNotifications')}</span>
                     <button
                       onClick={() => handleNotificationToggle('follows')}
                       className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${
                         notificationSettings.follows ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                       }`}
                     >
                       <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                         notificationSettings.follows ? 'right-0.5' : 'left-0.5'
                       }`}></div>
                     </button>
                   </div>
                </div>
              </div>
              
              {/* Other Settings */}
              <div>
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('otherSettings')}</h3>
                <div className="space-y-2">
                  <div className="relative">
                     <button 
                       onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                       className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                     >
                       <div className="flex items-center justify-between">
                         <span>{t('languageSettings')}</span>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-gray-500">{languages.find(l => l.code === selectedLanguage)?.name}</span>
                           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                           </svg>
                         </div>
                       </div>
                     </button>
                     {showLanguageOptions && (
                       <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                         {languages.map((lang) => (
                           <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLanguage(lang.code);
                                setLocale(lang.code as 'zh' | 'en' | 'ja');
                                setShowLanguageOptions(false);
                              }}
                              className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                                selectedLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                              }`}
                            >
                              {lang.name}
                            </button>
                         ))}
                       </div>
                     )}
                   </div>
                  <button onClick={() => setShowHelpModal(true)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <div className="flex items-center justify-between">
                       <span>{t('helpSupport')}</span>
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                     </div>
                   </button>
                   <button onClick={() => setShowAboutModal(true)} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                     <div className="flex items-center justify-between">
                       <span>{t('aboutUs')}</span>
                       <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                       </svg>
                     </div>
                   </button>
                  <button onClick={onLogout} className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <span>{t('logout')}</span>
                      <LogOutIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600 dark:text-red-400">
                    <span>{t('deleteAccount')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
       )}
       
       {/* Help Modal */}
       {showHelpModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
               <h2 className="text-lg font-bold">帮助与支持</h2>
               <button onClick={() => setShowHelpModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             <div className="p-4 space-y-4">
               <div>
                 <h3 className="font-semibold mb-2">常见问题</h3>
                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                   <p>• 如何修改个人信息？</p>
                   <p>• 如何设置隐私权限？</p>
                   <p>• 如何管理通知设置？</p>
                   <p>• 如何联系客服？</p>
                 </div>
               </div>
               <div>
                 <h3 className="font-semibold mb-2">联系我们</h3>
                 <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                   <p>📧 邮箱：support@nchat.com</p>
                   <p>📞 电话：400-123-4567</p>
                   <p>💬 在线客服：工作日 9:00-18:00</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
       
       {/* About Modal */}
       {showAboutModal && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
               <h2 className="text-lg font-bold">关于我们</h2>
               <button onClick={() => setShowAboutModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             <div className="p-4 space-y-4">
               <div>
                 <h3 className="font-semibold mb-2">NChat 社交平台</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                   NChat 是一个现代化的社交媒体平台，致力于为用户提供安全、便捷、有趣的社交体验。我们相信每个人都有表达自己的权利，每个声音都值得被听见。
                 </p>
               </div>
               <div>
                 <h3 className="font-semibold mb-2">版本信息</h3>
                 <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                   <p>版本：v2.0.0</p>
                   <p>更新时间：2024年1月</p>
                   <p>开发团队：NChat Team</p>
                 </div>
               </div>
               <div>
                 <h3 className="font-semibold mb-2">法律信息</h3>
                 <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                   <p>• 用户协议</p>
                   <p>• 隐私政策</p>
                   <p>• 社区准则</p>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default Profile;