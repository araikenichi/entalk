
import React, { useState, useMemo } from 'react';
import { users, mockCommunities, mockOpportunities } from '../constants';
import { User, Community, Opportunity } from '../types';
import { SparklesIcon, GroupIcon, BriefcaseIcon, CheckIcon, MessagesIcon } from '../components/Icons';

interface NetworkProps {
  currentUser: User;
  currentUserId: string;
  followedUserIds: string[];
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

type ActiveTab = 'connections' | 'communities' | 'opportunities';
type CommunitySort = 'recommended' | 'popular' | 'newest';

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-2 flex items-center justify-center space-x-2 border-b-2 text-sm sm:text-base font-semibold transition-colors ${
      isActive
        ? 'border-blue-500 text-blue-500'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const UserCard: React.FC<{
    user: User;
    isFollowed: boolean;
    onFollowToggle: (userId: string) => void;
    onViewProfile: (userId: string) => void;
}> = ({ user, isFollowed, onFollowToggle, onViewProfile }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex flex-col items-center text-center transition-transform hover:scale-105">
        <button onClick={() => onViewProfile(user.id)} className="w-20 h-20 rounded-full overflow-hidden">
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </button>
        <h3 className="font-bold mt-3 text-gray-900 dark:text-gray-100">{user.name}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">@{user.handle}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{user.jobTitle}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-1">
            {user.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
        </div>
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
            <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                <MessagesIcon />
            </button>
        </div>
    </div>
);


const CommunityCard: React.FC<{ community: Community }> = ({ community }) => {
    const [isJoined, setIsJoined] = useState(false);
    
    const relatedOpportunities = useMemo(() => 
        mockOpportunities.filter(opp => 
            opp.tags.some(tag => community.tags.includes(tag))
        ), [community.tags]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-xl flex flex-col">
            <img src={community.bannerImage} alt={community.name} className="w-full h-24 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{community.name}</h3>
                
                <div className="flex items-center my-2">
                    <div className="flex -space-x-2">
                        {community.members.slice(0,3).map(member => (
                            <img key={member.name} src={member.avatar} alt={member.name} title={member.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800"/>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-2">{community.memberCount.toLocaleString()} members</p>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 h-10 overflow-hidden">{community.description}</p>
                
                 <div className="my-2 flex flex-wrap gap-1">
                    {community.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>

                {community.latestPostPreview && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md text-sm">
                        <p className="text-gray-600 dark:text-gray-400 truncate">
                            <span className="font-semibold">{community.latestPostPreview.author}:</span> {community.latestPostPreview.content}
                        </p>
                    </div>
                )}
                
                {relatedOpportunities.length > 0 && (
                     <div className="mt-2 text-xs text-blue-500 flex items-center">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        <span className="ml-1">{relatedOpportunities.length} related opportunities</span>
                    </div>
                )}

                <button 
                    onClick={() => setIsJoined(!isJoined)}
                    className={`w-full mt-4 text-sm font-semibold py-2 rounded-full transition-colors ${isJoined ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                    {isJoined ? 'Joined' : 'Join / 参加する'}
                </button>
            </div>
        </div>
    );
};

const OpportunityCard: React.FC<{ opportunity: Opportunity }> = ({ opportunity }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-shadow hover:shadow-xl flex flex-col">
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{opportunity.title}</h3>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">{opportunity.type}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{opportunity.company} · {opportunity.location}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3">{opportunity.description}</p>
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


const Network: React.FC<NetworkProps> = ({ currentUser, currentUserId, followedUserIds, onFollowToggle, onViewProfile }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('communities');
  const [communitySort, setCommunitySort] = useState<CommunitySort>('recommended');

  const recommendedUsers = Object.values(users).filter(u => u.id !== currentUserId && !followedUserIds.includes(u.id));

  const sortedCommunities = useMemo(() => {
    let communities = [...mockCommunities];
    switch(communitySort) {
      case 'popular':
        return communities.sort((a, b) => b.memberCount - a.memberCount);
      case 'newest':
        return communities.reverse();
      case 'recommended':
      default:
        // Simple recommendation: move communities with matching tags to the front
        return communities.sort((a, b) => {
            const aMatch = a.tags.some(tag => currentUser.tags.includes(tag));
            const bMatch = b.tags.some(tag => currentUser.tags.includes(tag));
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
        });
    }
  }, [communitySort, currentUser.tags]);

  const aiRecommendedCommunities = sortedCommunities.filter(c => c.tags.some(tag => currentUser.tags.includes(tag)));

  return (
    <div className="bg-gray-100 dark:bg-black min-h-screen">
      <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">Network</h1>
      
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex">
        <TabButton label="Connections" icon={<SparklesIcon />} isActive={activeTab === 'connections'} onClick={() => setActiveTab('connections')} />
        <TabButton label="Communities" icon={<GroupIcon />} isActive={activeTab === 'communities'} onClick={() => setActiveTab('communities')} />
        <TabButton label="Opportunities" icon={<BriefcaseIcon />} isActive={activeTab === 'opportunities'} onClick={() => setActiveTab('opportunities')} />
      </div>

      <div className="p-4">
        {activeTab === 'connections' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">AI-Powered Recommendations</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendedUsers.map(user => (
                <UserCard 
                    key={user.id} 
                    user={user} 
                    isFollowed={followedUserIds.includes(user.id)} 
                    onFollowToggle={onFollowToggle}
                    onViewProfile={onViewProfile}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'communities' && (
           <div>
            <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex-shrink-0 pr-2">Discover Communities</h2>
                 <div className="flex-1 overflow-x-auto">
                    <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-full text-sm w-max ml-auto">
                        <button onClick={() => setCommunitySort('recommended')} className={`px-3 py-1 rounded-full whitespace-nowrap ${communitySort === 'recommended' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>Recommended</button>
                        <button onClick={() => setCommunitySort('popular')} className={`px-3 py-1 rounded-full whitespace-nowrap ${communitySort === 'popular' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>Popular</button>
                        <button onClick={() => setCommunitySort('newest')} className={`px-3 py-1 rounded-full whitespace-nowrap ${communitySort === 'newest' ? 'bg-white dark:bg-gray-700 shadow' : ''}`}>Newest</button>
                    </div>
                 </div>
            </div>
            
            {communitySort === 'recommended' && aiRecommendedCommunities.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                        <SparklesIcon className="w-5 h-5 text-blue-500 mr-2" />
                        AI Recommended For You
                    </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiRecommendedCommunities.map(community => (
                            <CommunityCard key={community.id} community={community} />
                        ))}
                    </div>
                    <hr className="my-6 border-gray-300 dark:border-gray-700"/>
                </div>
            )}

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCommunities.map(community => (
                    <CommunityCard key={community.id} community={community} />
                ))}
            </div>
           </div>
        )}
        
        {activeTab === 'opportunities' && (
           <div>
             <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Latest Opportunities</h2>
             <div className="space-y-4">
                {mockOpportunities.map(opp => (
                    <OpportunityCard key={opp.id} opportunity={opp} />
                ))}
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Network;