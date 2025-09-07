// FIX: Defined ActiveView type directly to remove circular dependency.
export type ActiveView = 'feed' | 'network' | 'messages' | 'search' | 'profile' | 'live-broadcaster' | 'me';
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  coverImage: string;
  bio: string;
  jobTitle: string;
  location: string;
  tags: string[];
  followingCount: number;
  followerCount: number;
  postCount: number;
}

export interface SignUpData {
  name: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  bio: string;
  password: string;
}

export enum PostType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Live = 'live',
}

export interface Media {
  type: 'image' | 'video';
  url: string;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  originalText?: string;
  translation?: string;
  isTranslating?: boolean;
}

export interface Post {
  id:string;
  user: User;
  content: string;
  type: PostType;
  media?: Media[];
  likes: number;
  shares: number;
  comments: Comment[];
  createdAt: string;
  viewers?: number;
  wasLive?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  media?: Media;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: DirectMessage[];
  unreadCount?: number;
}

export interface Community {
    id: string;
    name: string;
    description: string;
    bannerImage: string;
    memberCount: number;
    tags: string[];
    members: User[];
    latestPostPreview?: {
        author: string;
        content: string;
    }
}

export interface Opportunity {
    id: string;
    title: string;
    company: string;
    location: string;
    description: string;
    type: 'Full-time' | 'Contract' | 'Collaboration';
    tags: string[];
}