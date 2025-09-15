import React from 'react';
import Profile from './Profile';
import { User, Post } from '../types';

interface MeProps {
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

const Me: React.FC<MeProps> = (props) => {
  // Me页面就是当前用户的Profile页面
  return (
    <Profile
      user={props.currentUser}
      currentUser={props.currentUser}
      posts={props.posts.filter(post => post.user.id === props.currentUserId)}
      currentUserId={props.currentUserId}
      followedUserIds={props.followedUserIds}
      onFollowToggle={props.onFollowToggle}
      onViewProfile={props.onViewProfile}
      onBack={props.onBack}
      onUpdateProfile={props.onUpdateProfile}
      onLogout={props.onLogout}
      onStartMessage={props.onStartMessage}
    />
  );
};

export default Me;