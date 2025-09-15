import React, { useState, useEffect } from 'react';
import { mockPosts, users as initialUsers, mockCommunities, mockOpportunities } from './constants';
import { Post, PostType, Media, User } from './types';
import type { ActiveView } from './types';
import Feed from './views/Feed';
import Network from './views/Network';
import Messages from './views/Messages';
import Search from './views/Search';
import Profile from './views/Profile';
import Me from './views/Me';
import BottomNav from '../components/BottomNav';
import PostCreator from '../components/PostCreator';
import LiveStreamSetupModal from '../components/LiveStreamSetupModal';
import LiveBroadcasterView from './views/LiveBroadcasterView';
import { I18nProvider } from '../contexts/I18nContext';
import ErrorBoundary from '../components/ErrorBoundary';

// 認証画面（props名に合わせて配線）
import SignUp from './views/auth/SignUp';
import Login from './views/auth/Login';
import VerifyEmail from './views/auth/VerifyEmail';

// ==================== MainApp（元コード） ====================
const MainApp: React.FC<{ currentUser: User; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  const [isSettingUpLive, setIsSettingUpLive] = useState(false);
  const [liveStreamPost, setLiveStreamPost] = useState<Post | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(['u1']);
  const [userProfile, setUserProfile] = useState<User>(currentUser);
  const [showGlobalPostCreator, setShowGlobalPostCreator] = useState(false);
  const currentUserId = userProfile.id;

  useEffect(() => {
    if (activeView === 'profile') window.scrollTo(0, 0);
  }, [activeView, viewingProfileId]);

  const handleUpdateProfile = (updatedData: Partial<User>) => setUserProfile(prev => ({ ...prev, ...updatedData }));

  const handleAddPost = (postData: { content: string; type: PostType; media?: Media[] }) => {
    const newPost: Post = {
      id: `p${Date.now()}`,
      user: userProfile,
      ...postData,
      likes: 0,
      shares: 0,
      comments: [],
      createdAt: 'Just now',
    };
    setPosts([newPost, ...posts]);
  };

  const handleUpdatePost = (postId: string, newContent: string) =>
    setPosts(posts.map(p => (p.id === postId ? { ...p, content: newContent } : p)));

  const handleDeletePost = (postId: string) => setPosts(posts.filter(p => p.id !== postId));

  const handleStartLiveStreamSetup = () => setIsSettingUpLive(true);

  const handleConfirmLiveStream = (description: string) => {
    const newLivePost: Post = {
      id: `p${Date.now()}`,
      user: userProfile,
      content: description,
      type: PostType.Live,
      media: [{ type: 'image', url: `https://picsum.photos/seed/live${Date.now()}/800/450` }],
      likes: 0,
      shares: 0,
      comments: [],
      createdAt: 'Now',
      viewers: 1,
    };
    setPosts([newLivePost, ...posts]);
    setLiveStreamPost(newLivePost);
    setIsSettingUpLive(false);
    setActiveView('live-broadcaster');
  };

  const handleEndLiveStream = () => {
    if (liveStreamPost) {
      setPosts(posts.map(p => (p.id === liveStreamPost.id ? { ...p, type: PostType.Video, wasLive: true, viewers: undefined } : p)));
    }
    setLiveStreamPost(null);
    setActiveView('feed');
  };

  const handleFollowToggle = (userId: string) =>
    setFollowedUserIds(prev => (prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]));

  const handleViewProfile = (userId: string) => {
    setViewingProfileId(userId);
    setActiveView('profile');
  };

  const handleStartMessage = (userId: string) => {
    // 设置目标用户ID并导航到消息页面
    setMessageTargetUserId(userId);
    setActiveView('messages');
    console.log('开始与用户', userId, '的私信对话');
  };

  const handleNavigate = (view: ActiveView) => {
    setViewingProfileId(null);
    setActiveView(view);
  };

  const handleBackToFeed = () => setActiveView('feed');

  const renderView = () => {
    switch (activeView) {
      case 'network':
        return (
          <Network
            currentUser={userProfile}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
          />
        );
      case 'search':
        return (
          <Search
            posts={posts}
            users={Object.values(initialUsers)}
            communities={mockCommunities}
            opportunities={mockOpportunities}
            currentUser={userProfile}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
          />
        );
      case 'messages':
        return (
           <Messages 
             currentUser={userProfile} 
             onNavigateBack={() => {
               setMessageTargetUserId(null);
               handleBackToFeed();
             }}
             targetUserId={messageTargetUserId}
             onViewProfile={handleViewProfile}
           />
         );
      case 'me':
        return (
          <Me
            currentUser={userProfile}
            posts={posts}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
            onBack={handleBackToFeed}
            onUpdateProfile={handleUpdateProfile}
            onLogout={onLogout}
            onStartMessage={handleStartMessage}
          />
        );
      case 'profile': {
        let userToShow = userProfile;
        if (viewingProfileId && viewingProfileId !== currentUserId) {
          // 根据用户ID查找对应的用户
          const foundUser = Object.values(initialUsers).find(user => user.id === viewingProfileId);
          userToShow = foundUser || userProfile;
        }

        return (
          <Profile
            user={userToShow}
            currentUser={userProfile}
            posts={posts}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
            onBack={handleBackToFeed}
            onUpdateProfile={handleUpdateProfile}
            onLogout={onLogout}
            onStartMessage={handleStartMessage}
          />
        );
      }
      case 'feed':
      default:
        return (
          <Feed
            posts={posts}
            currentUser={userProfile}
            onStartLiveStream={handleStartLiveStreamSetup}
            onAddPost={handleAddPost}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeletePost}
            currentUserId={currentUserId}
            followedUserIds={followedUserIds}
            onFollowToggle={handleFollowToggle}
            onViewProfile={handleViewProfile}
            onNavigateToSearch={() => setActiveView('search')}
          />
        );
    }
  };

  if (activeView === 'live-broadcaster' && liveStreamPost) {
    return <LiveBroadcasterView post={liveStreamPost} onEndStream={handleEndLiveStream} />;
  }

  const showBottomNav = activeView !== 'messages' && activeView !== 'live-broadcaster';

  return (
    <ErrorBoundary>
      <div className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
        <main className={showBottomNav ? 'pb-[69px]' : ''}>{renderView()}</main>

        {isSettingUpLive && (
          <LiveStreamSetupModal onConfirm={handleConfirmLiveStream} onCancel={() => setIsSettingUpLive(false)} />
        )}

        {/* Global Post Creator */}
        {showGlobalPostCreator && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-out animate-slideUp">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setShowGlobalPostCreator(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold bg-white dark:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                >
                  ✕
                </button>
              </div>
              <PostCreator 
                currentUser={userProfile} 
                onStartLiveStream={handleStartLiveStreamSetup} 
                onAddPost={(postData) => {
                  handleAddPost(postData);
                  setShowGlobalPostCreator(false);
                }} 
              />
            </div>
          </div>
        )}

        {showBottomNav && (
          <BottomNav 
            activeView={activeView} 
            onNavigate={handleNavigate} 
            onShowPostCreator={() => {
              console.log('Toggling post creator, current state:', showGlobalPostCreator);
              setShowGlobalPostCreator(!showGlobalPostCreator);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

// ==================== 認証ラッパー（自動ログイン） ====================
type AuthStage = 'signup' | 'login' | 'verify' | 'app';

const mockUser = (): User => ({
  id: 'u2',
  name: 'Li Wei',
  handle: 'liwei88',
  avatar: '/avatars/u2.png',
  bio: 'AI enthusiast and social tech lover.',
  coverImage: '',
  jobTitle: '',
  location: '',
  email: 'li.wei@example.com',
  tags: [],
  followingCount: 0,
  followerCount: 0,
  postCount: 0,
});

const App: React.FC = () => {
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('loggedIn') === 'true';
  const storedUser = typeof window !== 'undefined' ? (JSON.parse(localStorage.getItem('user') || 'null') as User | null) : null;

  const [stage, setStage] = useState<AuthStage>(isLoggedIn ? 'app' : 'signup');
  const [user, setUser] = useState<User | null>(isLoggedIn ? storedUser ?? mockUser() : null);

  const handleAuthSuccess = (u?: User) => {
    const finalUser = u ?? mockUser();
    setUser(finalUser);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(finalUser));
    setStage('app');
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('user');
    setUser(null);
    setStage('signup');
  };

  if (stage === 'signup') {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <SignUp
            onSignUpSuccess={(u: User) => handleAuthSuccess(u)}
            onSwitchToLogin={() => setStage('login')}
          />
        </div>
      </I18nProvider>
    );
  }

  if (stage === 'login') {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <Login
            onLogin={(u: User) => handleAuthSuccess(u)}
            onSwitchToSignUp={() => setStage('signup')}
            onForgotPassword={() => setStage('verify')}
          />
        </div>
      </I18nProvider>
    );
  }

  if (stage === 'verify') {
    return (
      <I18nProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <VerifyEmail user={user ?? mockUser()} onContinue={() => setStage('app')} />
          <div className="p-4 text-center">
            <button onClick={() => setStage('login')} className="mt-4 px-4 py-2 rounded-lg border">
              ログインへ
            </button>
          </div>
        </div>
      </I18nProvider>
    );
  }

  // stage === 'app'
  return (
    <I18nProvider>
      <MainApp currentUser={user ?? mockUser()} onLogout={handleLogout} />
    </I18nProvider>
  );
};

export default App;
