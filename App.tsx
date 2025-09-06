import React, { useState, useEffect } from 'react';
import { mockPosts, users as initialUsers, mockCommunities, mockOpportunities } from './constants';
import { Post, PostType, Media, User, AuthStatus } from './types';
import type { ActiveView } from './types';
import Feed from './views/Feed';
import Network from './views/Network';
import Messages from './views/Messages';
import Search from './views/Search';
import Profile from './views/Profile';
import BottomNav from './components/BottomNav';
import LiveStreamSetupModal from './components/LiveStreamSetupModal';
import LiveBroadcasterView from './views/LiveBroadcasterView';
import AuthFlow from './views/auth/AuthFlow';
import { authService } from './services/authService';
import { I18nProvider } from './contexts/I18nContext';

const MainApp: React.FC<{
  currentUser: User;
  onLogout: () => void;
}> = ({ currentUser, onLogout }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isSettingUpLive, setIsSettingUpLive] = useState(false);
  const [liveStreamPost, setLiveStreamPost] = useState<Post | null>(null);
  
  // 'u2' is Li Wei. Initially follows 'u1' Sato.
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(['u1']); 
  
  const [userProfile, setUserProfile] = useState<User>(currentUser);
  const currentUserId = userProfile.id;

  useEffect(() => {
    // When switching to a profile view, scroll to top
    if (activeView === 'profile') {
      window.scrollTo(0, 0);
    }
  }, [activeView, viewingProfileId]);

  const handleUpdateProfile = (updatedData: Partial<User>) => {
    setUserProfile(prev => {
        const updatedUser = { ...prev, ...updatedData };
        authService.updateUser(updatedUser); // Persist changes
        return updatedUser;
    });
  };

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

  const handleUpdatePost = (postId: string, newContent: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, content: newContent } : p));
  };
  
  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  const handleStartLiveStreamSetup = () => {
    setIsSettingUpLive(true);
  };

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
      setPosts(posts.map(p => p.id === liveStreamPost.id ? { ...p, type: PostType.Video, wasLive: true, viewers: undefined } : p));
    }
    setLiveStreamPost(null);
    setActiveView('feed');
  };

  const handleFollowToggle = (userId: string) => {
    setFollowedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const handleViewProfile = (userId: string) => {
    setViewingProfileId(userId);
    setActiveView('profile');
  };
  
  const handleNavigate = (view: ActiveView) => {
    if (view === 'me') {
        setViewingProfileId(currentUserId);
        setActiveView('profile');
    } else {
        setViewingProfileId(null);
        setActiveView(view);
    }
  };
  
  const handleBackToFeed = () => {
    setActiveView('feed');
  };

  const renderView = () => {
    switch (activeView) {
      case 'network':
        return <Network currentUser={userProfile} currentUserId={currentUserId} followedUserIds={followedUserIds} onFollowToggle={handleFollowToggle} onViewProfile={handleViewProfile} />;
      case 'search':
        return <Search 
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
               />;
      case 'messages':
        return <Messages currentUser={userProfile} onNavigateBack={handleBackToFeed} />;
      case 'profile':
        let userToShow: User;
        if (viewingProfileId === currentUserId || !viewingProfileId) {
            userToShow = userProfile;
        } else {
            const userKey = Object.keys(initialUsers).find(key => initialUsers[key].id === viewingProfileId);
            userToShow = userKey ? initialUsers[userKey] : userProfile;
        }
        
        return <Profile 
                  user={userToShow} 
                  currentUser={userProfile}
                  posts={posts} 
                  currentUserId={currentUserId}
                  followedUserIds={followedUserIds}
                  onFollowToggle={handleFollowToggle}
                  onViewProfile={handleViewProfile}
                  onBack={() => setActiveView('feed')} 
                  onUpdateProfile={handleUpdateProfile}
                  onLogout={onLogout}
                />;
      case 'feed':
      default:
        return <Feed 
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
                />;
    }
  };

  if (activeView === 'live-broadcaster' && liveStreamPost) {
    return <LiveBroadcasterView post={liveStreamPost} onEndStream={handleEndLiveStream} />;
  }
  
  const showBottomNav = activeView !== 'messages' && activeView !== 'live-broadcaster';

  return (
    <div className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-gray-100">
      <main className={showBottomNav ? "pb-[69px]" : ""}>
        {renderView()}
      </main>
      
      {isSettingUpLive && (
        <LiveStreamSetupModal 
          onConfirm={handleConfirmLiveStream}
          onCancel={() => setIsSettingUpLive(false)}
        />
      )}

      {showBottomNav && <BottomNav activeView={activeView} onNavigate={handleNavigate} />}
    </div>
  );
};


const App: React.FC = () => {
    const [auth, setAuth] = useState<{ status: AuthStatus; user: User | null }>({ status: 'loading', user: null });

    useEffect(() => {
        const checkAuth = async () => {
            const user = await authService.checkSession();
            if (user) {
                setAuth({ status: 'authenticated', user });
            } else {
                setAuth({ status: 'unauthenticated', user: null });
            }
        };
        checkAuth();
    }, []);

    const handleLogin = (user: User) => {
        setAuth({ status: 'authenticated', user });
    };

    const handleLogout = () => {
        authService.logout();
        setAuth({ status: 'unauthenticated', user: null });
    };

    const renderContent = () => {
        switch(auth.status) {
            case 'loading':
                return (
                    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                );
            case 'authenticated':
                return auth.user ? <MainApp currentUser={auth.user} onLogout={handleLogout} /> : null;
            case 'unauthenticated':
                return <AuthFlow onLogin={handleLogin} />;
        }
    }

    return (
        <I18nProvider>
            {renderContent()}
        </I18nProvider>
    );
};

export default App;
