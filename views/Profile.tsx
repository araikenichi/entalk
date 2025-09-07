import React, { useState, useEffect, useRef } from 'react';
import { User, Post, PostType } from '../types';
import PostCard from '../components/PostCard';
import { ChevronLeftIcon, CheckIcon, CameraIcon, LogOutIcon } from '../components/Icons';

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
    onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'media'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverImageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedUser(user);
    if(user.id !== currentUserId) {
        setIsEditing(false);
    }
  }, [user, currentUserId]);

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
    <div className="bg-white dark:bg-black">
      {/* Hidden file inputs for image uploads */}
      <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleImageFileSelect(e, 'avatar')} className="hidden" />
      <input type="file" accept="image/*" ref={coverImageInputRef} onChange={(e) => handleImageFileSelect(e, 'coverImage')} className="hidden" />

      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black sticky top-0 z-10 flex items-center space-x-4">
         <button onClick={onBack} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
           <ChevronLeftIcon />
         </button>
         <div>
            <h1 className="text-xl font-bold">{displayUser.name}</h1>
            <p className="text-sm text-gray-500">{userPosts.length} posts</p>
         </div>
      </div>

      {/* Profile Info */}
      <div className="relative">
        <img src={displayUser.coverImage} alt="Cover" className="w-full h-40 md:h-56 object-cover" />
         {isEditing && (
            <button onClick={() => coverImageInputRef.current?.click()} className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors">
              <CameraIcon className="w-5 h-5" />
            </button>
        )}
        <div className="absolute -bottom-14 left-4">
          <div className="relative">
             <img src={displayUser.avatar} alt={displayUser.name} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white dark:border-black object-cover" />
             {isEditing && (
                <button onClick={() => avatarInputRef.current?.click()} className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-75 transition-colors">
                   <CameraIcon className="w-5 h-5" />
                </button>
             )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="text-right p-2 sm:p-4">
        {isCurrentUser ? (
          isEditing ? (
            <div className="flex justify-end space-x-2">
                <button onClick={handleCancel} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Cancel
                </button>
                 <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold">
                    Save
                </button>
            </div>
          ) : (
            <div className="flex justify-end space-x-2">
                <button onClick={onLogout} className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500">
                    <LogOutIcon />
                    <span>Logout</span>
                </button>
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Edit Profile
                </button>
            </div>
          )
        ) : isFollowed ? (
          <button onClick={() => onFollowToggle(user.id)} className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold ml-auto">
            <CheckIcon />
            <span className="ml-1">Following</span>
          </button>
        ) : (
          <button onClick={() => onFollowToggle(user.id)} className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors font-semibold ml-auto">
            Follow
          </button>
        )}
      </div>

      {/* User Details */}
      <div className="p-2 sm:p-4 mt-10">
        {isEditing ? (
            <div className="space-y-4">
                 <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <input name="name" value={editedUser.name} onChange={handleInputChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1"/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-500">Bio</label>
                    <textarea name="bio" value={editedUser.bio} onChange={handleInputChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1" rows={3}/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-500">Job Title</label>
                    <input name="jobTitle" value={editedUser.jobTitle} onChange={handleInputChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1"/>
                 </div>
                 <div>
                    <label className="text-sm text-gray-500">Location</label>
                    <input name="location" value={editedUser.location} onChange={handleInputChange} className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md mt-1"/>
                 </div>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold">{displayUser.name}</h2>
                <p className="text-gray-500">@{displayUser.handle}</p>
                <p className="mt-2 whitespace-pre-wrap">{displayUser.bio}</p>
                <p className="mt-1 text-sm text-gray-500">{displayUser.jobTitle} at {displayUser.location}</p>
                <div className="flex space-x-2 mt-2">
                    {displayUser.tags.map(tag => (
                        <span key={tag} className="text-blue-500 text-sm hover:underline cursor-pointer">{tag}</span>
                    ))}
                </div>
            </>
        )}
      </div>
      
      {/* Stats */}
       <div className="p-2 sm:p-4 grid grid-cols-3 gap-4 border-y border-gray-200 dark:border-gray-800">
            <StatItem label="Posts" value={userPosts.length} />
            <StatItem label="Followers" value={displayUser.followerCount} />
            <StatItem label="Following" value={displayUser.followingCount} />
        </div>

      {/* Content Tabs */}
      <div>
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 p-4 font-semibold text-center transition-colors ${activeTab === 'posts' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            Posts
          </button>
          <button onClick={() => setActiveTab('media')} className={`flex-1 p-4 font-semibold text-center transition-colors ${activeTab === 'media' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
            Video/Live
          </button>
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
    </div>
  );
};

export default Profile;