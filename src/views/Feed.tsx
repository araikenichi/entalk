import React, { useState, useEffect, useRef } from 'react';
import PostCreator from '../../components/PostCreator';
import PostCard from '../../components/PostCard';
import { Post, PostType, Media, User } from '../types';
import { SearchIcon, EditIcon } from '../../components/Icons';
import { users } from '../constants';
import { useTranslation } from '../../hooks/useTranslation';

type FeedTab = 'following' | 'recommended' | 'nearby';

interface FeedProps {
  posts: Post[];
  currentUser: User;
  onStartLiveStream: () => void;
  onAddPost: (postData: { content: string; type: PostType; media?: Media[] }) => void;
  onUpdatePost: (postId: string, newContent: string) => void;
  onDeletePost: (postId: string) => void;
  currentUserId: string;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onNavigateToSearch?: () => void;
  showPostCreator?: boolean;
  onTogglePostCreator?: () => void;
}

const Feed: React.FC<FeedProps> = ({ 
  posts, 
  currentUser,
  onStartLiveStream, 
  onAddPost, 
  onUpdatePost, 
  onDeletePost,
  currentUserId,
  followedUserIds,
  onFollowToggle,
  onViewProfile,
  onNavigateToSearch,
  showPostCreator = false,
  onTogglePostCreator,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<FeedTab>('recommended');
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 32, left: 0 });
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);

  useEffect(() => {
    let filtered: Post[] = [];
    
    switch (activeTab) {
      case 'following':
        filtered = posts.filter(post => followedUserIds.includes(post.user.id));
        break;
      case 'recommended':
        filtered = posts;
        break;
      case 'nearby':
        filtered = posts.filter(post => post.user.location && post.user.location.includes('San Francisco'));
        break;
    }
    
    setFilteredPosts(filtered);
  }, [activeTab, posts, followedUserIds]);

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = tabRefs.current[activeTab];
      if (activeButton) {
        const rect = activeButton.getBoundingClientRect();
        const parentRect = activeButton.parentElement?.getBoundingClientRect();
        if (parentRect) {
          setIndicatorStyle({
            width: 32,
            left: rect.left - parentRect.left + rect.width / 2 - 16
          });
        }
      }
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [activeTab, t]);


  return (
    <div className="bg-white dark:bg-black min-h-screen">
      {/* Header */}
      <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold">{t('home')}</h1>
          <div className="relative">
            <div className="flex items-center space-x-6">
              <button 
                ref={(el) => { tabRefs.current['following'] = el; }}
                onClick={() => setActiveTab('following')}
                className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'following'
                    ? 'text-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t('following')}
              </button>
              <button 
                ref={(el) => { tabRefs.current['recommended'] = el; }}
                onClick={() => setActiveTab('recommended')}
                className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'recommended'
                    ? 'text-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t('recommended')}
              </button>
              <button 
                ref={(el) => { tabRefs.current['nearby'] = el; }}
                onClick={() => setActiveTab('nearby')}
                className={`py-2 px-3 text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'nearby'
                    ? 'text-blue-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t('nearby')}
              </button>
            </div>
            <div 
                className="absolute bottom-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out rounded-full"
                style={{
                  width: `${indicatorStyle.width}px`,
                  left: `${indicatorStyle.left}px`
                }}
              />
          </div>
        <div className="flex items-center space-x-3">
          {/* Search Button */}
          <button 
            onClick={onNavigateToSearch}
            className="flex flex-col items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Search"
          >
            <SearchIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      
      {/* Post Creator - Show/Hide based on state */}
      {showPostCreator && (
        <PostCreator 
          currentUser={currentUser} 
          onStartLiveStream={onStartLiveStream} 
          onAddPost={(postData) => {
            onAddPost(postData);
            onTogglePostCreator?.(); // Hide after posting
          }} 
        />
      )}
      <div>
        {filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onUpdatePost={onUpdatePost}
            onDeletePost={onDeletePost}
            currentUserId={currentUserId}
            currentUser={currentUser}
            isFollowed={followedUserIds.includes(post.user.id)}
            onFollowToggle={onFollowToggle}
            onViewProfile={onViewProfile}
          />
        ))}
      </div>
    </div>
  );
};

export default Feed;
