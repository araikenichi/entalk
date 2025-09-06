
import React, { useState, useMemo } from 'react';
import { Post, User, Community, Opportunity } from '../types';
import PostCard from '../components/PostCard';
import { SearchIcon, CheckIcon } from '../components/Icons';

const UserCard: React.FC<{
    user: User;
    isFollowed: boolean;
    onFollowToggle: (userId: string) => void;
    onViewProfile: (userId: string) => void;
}> = ({ user, isFollowed, onFollowToggle, onViewProfile }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center text-center">
        <button onClick={() => onViewProfile(user.id)} className="w-20 h-20 rounded-full overflow-hidden">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </button>
        <h3 className="font-bold mt-3 text-gray-900 dark:text-gray-100">{user.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.jobTitle}</p>
        <div className="mt-4 flex space-x-2 w-full">
            {isFollowed ? (
                 <button onClick={() => onFollowToggle(user.id)} className="flex-1 flex items-center justify-center text-sm px-3 py-1.5 border border-blue-500 text-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <CheckIcon />
                    <span className="ml-1">Following</span>
                </button>
            ) : (
                <button onClick={() => onFollowToggle(user.id)} className="flex-1 text-sm px-3 py-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                    Follow
                </button>
            )}
        </div>
    </div>
);

const CommunityCard: React.FC<{ community: Community }> = ({ community }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col">
        <img src={community.bannerImage} alt={community.name} className="w-full h-24 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{community.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 my-1">{community.memberCount.toLocaleString()} members</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{community.description}</p>
            <button className="w-full mt-4 text-sm font-semibold py-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                Join / 参加する
            </button>
        </div>
    </div>
);

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col">
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{opportunity.title}</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium whitespace-nowrap">{opportunity.type}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{opportunity.company} · {opportunity.location}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
             <div className="flex flex-wrap gap-1">
                 {opportunity.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
            </div>
            <button className="text-sm font-semibold text-blue-500 hover:underline">View</button>
        </div>
    </div>
);

interface SearchProps {
  posts: Post[];
  users: User[];
  communities: Community[];
  opportunities: Opportunity[];
  currentUser: User;
  currentUserId: string;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
  onUpdatePost: (postId: string, newContent: string) => void;
  onDeletePost: (postId: string) => void;
}

type SearchTab = 'all' | 'people' | 'communities' | 'posts' | 'opportunities';

const Search: React.FC<SearchProps> = (props) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  
  const recentSearches = ['AI Engineer', '日中翻訳', 'Product Manager'];
  const trendingTopics = ['#Fintech', '#OpenSource', '#JapanCareer', '#RemoteWork'];

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return null;
    }
    const lowerCaseQuery = query.toLowerCase();
    
    const people = props.users.filter(u => 
        u.name.toLowerCase().includes(lowerCaseQuery) || 
        u.handle.toLowerCase().includes(lowerCaseQuery) ||
        u.bio.toLowerCase().includes(lowerCaseQuery) ||
        u.tags.some(t => t.toLowerCase().includes(lowerCaseQuery))
    );
    const communities = props.communities.filter(c =>
        c.name.toLowerCase().includes(lowerCaseQuery) ||
        c.description.toLowerCase().includes(lowerCaseQuery) ||
        c.tags.some(t => t.toLowerCase().includes(lowerCaseQuery))
    );
    const posts = props.posts.filter(p =>
        p.content.toLowerCase().includes(lowerCaseQuery) ||
        p.user.name.toLowerCase().includes(lowerCaseQuery)
    );
    const opportunities = props.opportunities.filter(o =>
        o.title.toLowerCase().includes(lowerCaseQuery) ||
        o.company.toLowerCase().includes(lowerCaseQuery) ||
        o.description.toLowerCase().includes(lowerCaseQuery) ||
        o.tags.some(t => t.toLowerCase().includes(lowerCaseQuery))
    );

    return { people, communities, posts, opportunities };
  }, [query, props.posts, props.users, props.communities, props.opportunities]);

  const renderContent = () => {
    if (!searchResults) {
        return (
            <div className="p-4">
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Recent Searches</h3>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map(s => <button key={s} onClick={() => setQuery(s)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm hover:bg-gray-300 dark:hover:bg-gray-600">{s}</button>)}
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Trending Topics</h3>
                    <div className="flex flex-wrap gap-2">
                         {trendingTopics.map(t => <button key={t} onClick={() => setQuery(t)} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-900">{t}</button>)}
                    </div>
                </div>
            </div>
        );
    }
    
    const tabs: {key: SearchTab, label: string}[] = [
        { key: 'all', label: 'All' },
        { key: 'people', label: 'People' },
        { key: 'communities', label: 'Communities' },
        { key: 'posts', label: 'Posts' },
        { key: 'opportunities', label: 'Opportunities' },
    ];

    const renderResults = () => {
        const noResults = searchResults.people.length === 0 && searchResults.communities.length === 0 && searchResults.posts.length === 0 && searchResults.opportunities.length === 0;

        if (noResults) {
            return <p className="text-center text-gray-500 p-8">No results found for "{query}".</p>;
        }

        switch(activeTab) {
            case 'people':
                return searchResults.people.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">{searchResults.people.map(u => <UserCard key={u.id} user={u} isFollowed={props.followedUserIds.includes(u.id)} onFollowToggle={props.onFollowToggle} onViewProfile={props.onViewProfile} />)}</div> : <p className="text-center text-gray-500 p-8">No people found.</p>;
            case 'communities':
                return searchResults.communities.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">{searchResults.communities.map(c => <CommunityCard key={c.id} community={c} />)}</div> : <p className="text-center text-gray-500 p-8">No communities found.</p>;
            case 'posts':
                return searchResults.posts.length > 0 ? <div>{searchResults.posts.map(p => <PostCard key={p.id} post={p} {...props} isFollowed={props.followedUserIds.includes(p.user.id)} />)}</div> : <p className="text-center text-gray-500 p-8">No posts found.</p>;
            case 'opportunities':
                 return searchResults.opportunities.length > 0 ? <div className="space-y-4 p-4">{searchResults.opportunities.map(o => <OpportunityCard key={o.id} opportunity={o} />)}</div> : <p className="text-center text-gray-500 p-8">No opportunities found.</p>;
            case 'all':
            default:
                return (
                    <div>
                        {searchResults.people.length > 0 && <div className="p-4 border-b dark:border-gray-800"><h2 className="font-bold text-lg mb-2">People</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{searchResults.people.slice(0,3).map(u => <UserCard key={u.id} user={u} isFollowed={props.followedUserIds.includes(u.id)} onFollowToggle={props.onFollowToggle} onViewProfile={props.onViewProfile} />)}</div></div>}
                        {searchResults.posts.length > 0 && <div className="border-b dark:border-gray-800"><h2 className="font-bold text-lg mb-2 p-4">Posts</h2><div>{searchResults.posts.slice(0,3).map(p => <PostCard key={p.id} post={p} {...props} isFollowed={props.followedUserIds.includes(p.user.id)} />)}</div></div>}
                        {searchResults.communities.length > 0 && <div className="p-4 border-b dark:border-gray-800"><h2 className="font-bold text-lg mb-2">Communities</h2><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{searchResults.communities.slice(0,3).map(c => <CommunityCard key={c.id} community={c} />)}</div></div>}
                        {searchResults.opportunities.length > 0 && <div className="p-4"><h2 className="font-bold text-lg mb-2">Opportunities</h2><div className="space-y-4">{searchResults.opportunities.slice(0,3).map(o => <OpportunityCard key={o.id} opportunity={o} />)}</div></div>}
                    </div>
                );
        }
    }

    return (
        <div>
            <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
                {tabs.map(tab => (
                    <button 
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 p-3 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === tab.key ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            {renderResults()}
        </div>
    )

  };
  
  return (
    <div>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10">
        <div className="relative">
            <input 
                type="text"
                placeholder="Search people, posts, communities..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-gray-100 dark:bg-gray-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <SearchIcon className="w-5 h-5" />
            </div>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Search;
