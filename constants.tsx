
import React from 'react';
import { User, Post, PostType, Comment, Conversation, DirectMessage, Community, Opportunity } from './types';

export const users: { [key: string]: User } = {
  sato: { 
    id: 'u1', 
    name: 'Kenji Sato', 
    handle: 'kenji_sato', 
    email: 'kenji.sato@example.com',
    phoneNumber: '+81 90-1234-5678',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    coverImage: 'https://picsum.photos/seed/cover1/1200/400',
    bio: 'Product Manager in Tokyo, passionate about cross-border projects and fintech innovations. 日本語 & English.',
    jobTitle: 'Product Manager',
    location: 'Tokyo, Japan',
    tags: ['#Fintech', '#ProductManagement', '#AI'],
    followingCount: 150,
    followerCount: 2300,
    postCount: 98,
  },
  li: { 
    id: 'u2', 
    name: 'Li Wei', 
    handle: 'liwei_dev', 
    email: 'li.wei@example.com',
    phoneNumber: '+86 138-1234-5678',
    avatar: 'https://picsum.photos/seed/user2/100/100',
    coverImage: 'https://picsum.photos/seed/cover2/1200/400',
    bio: 'AI Engineer building the future. Focused on NLP and computer vision. Open to collaborations. 中文 & English.',
    jobTitle: 'AI Engineer',
    location: 'Shanghai, China',
    tags: ['#AI', '#Developer', '#OpenSource', '#NLP'],
    followingCount: 88,
    followerCount: 5400,
    postCount: 42,
  },
  emily: { 
    id: 'u3', 
    name: 'Emily Carter', 
    handle: 'emily_c', 
    email: 'emily.carter@example.com',
    phoneNumber: '+1 415-555-0101',
    avatar: 'https://picsum.photos/seed/user3/100/100',
    coverImage: 'https://picsum.photos/seed/cover3/1200/400',
    bio: 'Venture Capitalist connecting East and West. Always looking for the next big thing in tech.',
    jobTitle: 'Venture Capitalist',
    location: 'San Francisco, USA',
    tags: ['#VC', '#Startups', '#Investing'],
    followingCount: 500,
    followerCount: 12000,
    postCount: 123,
  },
  chen: { 
    id: 'u4', 
    name: 'Chen Yue', 
    handle: 'chenyue_art', 
    email: 'chen.yue@example.com',
    phoneNumber: '+86 139-8765-4321',
    avatar: 'https://picsum.photos/seed/user4/100/100',
    coverImage: 'https://picsum.photos/seed/cover4/1200/400',
    bio: 'Digital Artist & Illustrator. Creating worlds with pixels and code. Commissions are open.',
    jobTitle: 'Digital Artist',
    location: 'Beijing, China',
    tags: ['#DigitalArt', '#Illustration', '#NFTs'],
    followingCount: 210,
    followerCount: 8900,
    postCount: 250,
  },
};

export const mockComments: Comment[] = [
    { id: 'c1', user: users.sato, text: '素晴らしい写真ですね！' },
    { id: 'c2', user: users.chen, text: 'This looks amazing! Where was this taken?' },
];

export const mockPosts: Post[] = [
  {
    id: 'p1',
    user: users.sato,
    content: 'Exploring the beautiful streets of Kyoto. The autumn colors are breathtaking this year. 🍁',
    type: PostType.Image,
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/kyoto1/800/600' },
      { type: 'image', url: 'https://picsum.photos/seed/kyoto2/800/600' },
      { type: 'image', url: 'https://picsum.photos/seed/kyoto3/800/600' },
      { type: 'image', url: 'https://picsum.photos/seed/kyoto4/800/600' },
    ],
    likes: 1204,
    shares: 130,
    comments: mockComments,
    createdAt: '2h ago',
  },
  {
    id: 'p2',
    user: users.li,
    content: 'Just launched my new open-source project! It\'s a toolkit for building AI-powered applications. Check it out on GitHub. #AI #Developer #OpenSource',
    type: PostType.Text,
    likes: 856,
    shares: 210,
    comments: [{id: 'c3', user: users.emily, text: 'Congratulations! This is a huge achievement.'}],
    createdAt: '5h ago',
  },
    {
    id: 'p3',
    user: users.chen,
    content: 'Live from my studio! Painting a new piece, come hang out and chat. 🎨🖌️',
    type: PostType.Live,
    media: [{ type: 'image', url: 'https://picsum.photos/seed/live1/800/450' }],
    likes: 3400,
    shares: 50,
    comments: [],
    viewers: 2800,
    createdAt: 'Now',
  },
  {
    id: 'p4',
    user: users.emily,
    content: 'A quick look at my recent trip to the coast. The sound of the waves is so calming.',
    type: PostType.Video,
    media: [{ type: 'image', url: 'https://picsum.photos/seed/video1/800/450' }],
    likes: 932,
    shares: 88,
    comments: [],
    createdAt: '1d ago',
  },
  {
    id: 'p5',
    user: users.li,
    content: 'Just a couple of shots from my recent project photoshoot.',
    type: PostType.Image,
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/project1/600/600' },
      { type: 'image', url: 'https://picsum.photos/seed/project2/600/600' },
    ],
    likes: 450,
    shares: 45,
    comments: [],
    createdAt: '2d ago',
  },
  {
    id: 'p6',
    user: users.sato,
    content: 'Another live session about financial markets in Asia. Join us!',
    type: PostType.Live,
    media: [{ type: 'image', url: 'https://picsum.photos/seed/live2/800/450' }],
    likes: 1200,
    shares: 15,
    comments: [],
    viewers: 950,
    createdAt: 'Now',
  },
  {
    id: 'p7',
    user: users.chen,
    content: 'The complete nine-panel digital art series I\'ve been working on. Each one tells a part of the story.',
    type: PostType.Image,
    media: [
      { type: 'image', url: 'https://picsum.photos/seed/art1/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art2/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art3/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art4/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art5/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art6/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art7/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art8/400/400' },
      { type: 'image', url: 'https://picsum.photos/seed/art9/400/400' },
    ],
    likes: 2500,
    shares: 300,
    comments: [],
    createdAt: '3d ago',
  },
];

const now = Date.now();
export const mockConversations: Conversation[] = [
    {
        id: 'conv1',
        participants: [users.li, users.sato],
        unreadCount: 2,
        messages: [
            { id: 'dm1-1', senderId: 'u1', text: 'Hey Li Wei, saw your new project. Looks amazing!', timestamp: now - 1000 * 60 * 60 * 2 },
            { id: 'dm1-2', senderId: 'u2', text: 'Thanks, Kenji! Appreciate you checking it out.', timestamp: now - 1000 * 60 * 60 * 1.5 },
            { id: 'dm1-3', senderId: 'u1', text: 'Seriously impressive work. We should catch up properly soon.', timestamp: now - 1000 * 60 * 5 },
            { id: 'dm1-4', senderId: 'u1', text: 'Let me know when you are free next week.', timestamp: now - 1000 * 60 * 4 },
        ]
    },
    {
        id: 'conv2',
        participants: [users.li, users.emily],
        messages: [
            { id: 'dm2-1', senderId: 'u3', text: 'That video from your trip was beautiful!', timestamp: now - 1000 * 60 * 60 * 24 * 2 },
            { id: 'dm2-2', senderId: 'u2', text: 'Thank you! It was a very relaxing place.', timestamp: now - 1000 * 60 * 60 * 24 * 2 + 10000 },
            { id: 'dm2-3', senderId: 'u3', text: 'Check out this photo I took!', timestamp: now - 1000 * 60 * 60 * 24 * 1, media: { type: 'image', url: 'https://picsum.photos/seed/chatimg1/400/300' } },
        ]
    },
    {
        id: 'conv3',
        participants: [users.li, users.chen],
        unreadCount: 1,
        messages: [
            { id: 'dm3-1', senderId: 'u4', text: 'Your art series is mind-blowing. The detail is incredible.', timestamp: now - 1000 * 60 * 30 },
        ]
    }
];


export const mockCommunities: Community[] = [
    {
        id: 'com1',
        name: '日中翻訳・通訳コミュニティ',
        description: 'プロと学習者が集まり、翻訳スキルやキャリアについて情報交換する場です。',
        bannerImage: 'https://picsum.photos/seed/comm1/600/200',
        memberCount: 12500,
        tags: ['#Translation', '#Localization', '#Language'],
        members: [users.sato, users.chen],
        latestPostPreview: { author: 'Kenji Sato', content: 'Just shared a list of useful tools for technical translation...' }
    },
    {
        id: 'com2',
        name: 'AI Developers in Asia',
        description: 'A group for AI engineers and researchers across Asia to share breakthroughs, projects, and collaborate.',
        bannerImage: 'https://picsum.photos/seed/comm2/600/200',
        memberCount: 8900,
        tags: ['#AI', '#MachineLearning', '#Tech', '#Developer'],
        members: [users.li, users.sato, users.emily],
        latestPostPreview: { author: 'Li Wei', content: 'Posted a new paper on cross-lingual NLP models. Looking for feedback!' }
    },
    {
        id: 'com3',
        name: '日本での就職・キャリア',
        description: '日本での就職を目指す外国籍人材のための情報交換コミュニティ。面接対策や企業文化について話しましょう。',
        bannerImage: 'https://picsum.photos/seed/comm3/600/200',
        memberCount: 23000,
        tags: ['#Career', '#Japan', '#JobSeekers'],
        members: [users.sato, users.emily],
        latestPostPreview: { author: 'Emily Carter', content: 'Webinar next week: How to negotiate your salary in a Japanese company.' }
    }
];

export const mockOpportunities: Opportunity[] = [
    {
        id: 'opp1',
        title: 'Bilingual Product Manager (JP/CN)',
        company: 'InnovateTech Tokyo',
        location: 'Tokyo, Japan',
        description: 'Seeking a product manager to lead our new cross-border fintech application targeted at the Chinese market.',
        type: 'Full-time',
        tags: ['#Fintech', '#ProductManagement', '#Bilingual', '#Japan'],
    },
    {
        id: 'opp2',
        title: 'Frontend Developer (React/Vue)',
        company: 'Byte Creative Shanghai',
        location: 'Shanghai, China (Remote OK)',
        description: 'Join our creative team to build stunning web experiences for global brands entering the Japanese market.',
        type: 'Contract',
        tags: ['#Frontend', '#React', '#RemoteWork', '#Developer'],
    },
    {
        id: 'opp3',
        title: 'Collaboration: AI Translation App',
        company: 'Li Wei (Personal Project)',
        location: 'Cross-border',
        description: 'Looking for a UI/UX designer with experience in Japanese and Chinese markets to collaborate on a new AI translation app.',
        type: 'Collaboration',
        tags: ['#AI', '#Design', '#Startup', '#Translation'],
    }
];