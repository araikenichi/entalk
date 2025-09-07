import React from 'react';
import PostCreator from '../components/PostCreator';
import PostCard from '../components/PostCard';
import { Post, PostType, Media, User } from '../types';

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
}) => {
  return (
    <div>
      <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10">Home</h1>
      <PostCreator currentUser={currentUser} onStartLiveStream={onStartLiveStream} onAddPost={onAddPost} />
      <div>
        {posts.map(post => (
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
