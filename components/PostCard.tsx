import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment, PostType, User } from '../types';
import { geminiService } from '../services/geminiService';
import { 
  TranslateIcon, 
  LoadingIcon, 
  LikeIcon, 
  LikeIconFilled, 
  CommentIcon, 
  ShareIcon, 
  MoreHorizIcon, 
  EditIcon, 
  TrashIcon,
  SendIcon,
  PlayIcon,
  CheckIcon
} from './Icons';

interface PostCardProps {
  post: Post;
  onUpdatePost: (postId: string, newContent: string) => void;
  onDeletePost: (postId: string) => void;
  currentUserId: string;
  currentUser: User;
  isFollowed: boolean;
  onFollowToggle: (userId: string) => void;
  onViewProfile: (userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  onUpdatePost, 
  onDeletePost,
  currentUserId,
  currentUser,
  isFollowed,
  onFollowToggle,
  onViewProfile
}) => {
  const [comments, setComments] = useState<Comment[]>(post.comments);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [shareCount, setShareCount] = useState(post.shares);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false); // For video playback
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslatingPost, setIsTranslatingPost] = useState(false);
  const [showPostTranslation, setShowPostTranslation] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTranslateComment = async (commentId: string, text: string) => {
    const isJapanese = /[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+/.test(text);
    const targetLanguage = isJapanese ? 'Chinese' : 'Japanese';

    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isTranslating: true } : c));
    try {
      const translation = await geminiService.translateText(text, targetLanguage);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, translation, originalText: text, isTranslating: false } : c));
    } catch (error) {
      console.error("Translation failed", error);
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isTranslating: false } : c));
    }
  };
  
  const handleTranslatePost = async () => {
    if (translatedContent) {
      setShowPostTranslation(!showPostTranslation);
      return;
    }

    setIsTranslatingPost(true);
    const isJapanese = /[一-龠]+|[ぁ-ゔ]+|[ァ-ヴー]+/.test(post.content);
    const targetLanguage = isJapanese ? 'Chinese' : 'Japanese';

    try {
      const translation = await geminiService.translateText(post.content, targetLanguage);
      setTranslatedContent(translation);
      setShowPostTranslation(true);
    } catch (error) {
      console.error("Post translation failed", error);
    } finally {
      setIsTranslatingPost(false);
    }
  };


  const handleShowOriginal = (commentId: string) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, translation: undefined, text: c.originalText || c.text, originalText: undefined } : c));
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = () => {
    setShareCount(prev => prev + 1);
    console.log(`Shared post ${post.id}`);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      user: currentUser, // Use current user from props
      text: newComment.trim(),
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleSaveEdit = () => {
    if (editedContent.trim() !== post.content) {
      onUpdatePost(post.id, editedContent.trim());
    }
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditedContent(post.content);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
      onDeletePost(post.id);
  };

  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;

    if (post.type === PostType.Video || post.wasLive) {
      if (isPlaying) {
        return (
          <div className="mt-2 rounded-lg overflow-hidden border dark:border-gray-700">
            <video
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
              controls
              autoPlay
              className="w-full h-auto bg-black"
            />
          </div>
        );
      }
      return (
        <div
          className="mt-2 rounded-lg overflow-hidden relative cursor-pointer group border dark:border-gray-700"
          onClick={() => setIsPlaying(true)}
        >
          <img src={post.media[0].url} alt="video thumbnail" className="w-full h-auto" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
            <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <PlayIcon />
            </div>
          </div>
          {post.wasLive && (
             <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs font-bold">REPLAY</div>
          )}
        </div>
      );
    }

    if (post.type === PostType.Live && post.viewers) {
        return (
            <div className="mt-2 rounded-lg overflow-hidden relative border dark:border-gray-700">
                 <img src={post.media[0].url} alt="live stream thumbnail" className="w-full h-auto" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                 <div className="absolute top-2 left-2 flex items-center bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    LIVE
                 </div>
            </div>
        )
    }

    if (post.type === PostType.Image) {
      const imageCount = post.media.length;
      const images = post.media;

      if (imageCount === 1) {
        return (
          <div className="mt-2 rounded-lg overflow-hidden border dark:border-gray-700">
            <img src={images[0].url} alt="post content" className="w-full h-auto" />
          </div>
        );
      }

      if (imageCount === 2) {
        return (
          <div className="mt-2 rounded-lg overflow-hidden grid grid-cols-2 gap-1">
            <img src={images[0].url} alt="post content 1" className="w-full h-full object-cover aspect-square" />
            <img src={images[1].url} alt="post content 2" className="w-full h-full object-cover aspect-square" />
          </div>
        );
      }

      if (imageCount === 3) {
        return (
          <div className="mt-2 rounded-lg overflow-hidden grid grid-cols-2 grid-rows-2 gap-1 aspect-[4/3]">
            <div className="row-span-2">
              <img src={images[0].url} alt="post content 1" className="w-full h-full object-cover" />
            </div>
            <div>
              <img src={images[1].url} alt="post content 2" className="w-full h-full object-cover" />
            </div>
            <div>
              <img src={images[2].url} alt="post content 3" className="w-full h-full object-cover" />
            </div>
          </div>
        );
      }
      
      if (imageCount >= 4) {
        let gridClasses = 'grid-cols-2';
        if (imageCount >= 5) gridClasses = 'grid-cols-3';

        return (
          <div className={`mt-2 rounded-lg overflow-hidden grid ${gridClasses} gap-1`}>
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square">
                <img src={img.url} alt={`post content ${index + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-start space-x-3">
        <button onClick={() => onViewProfile(post.user.id)} className="flex-shrink-0">
          <img src={post.user.avatar} alt={post.user.name} className="w-12 h-12 rounded-full" />
        </button>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <div>
                   <button onClick={() => onViewProfile(post.user.id)} className="font-bold text-left hover:underline">{post.user.name}</button>
                   <div className="flex items-center space-x-1">
                     <span className="text-gray-500 text-sm">@{post.user.handle}</span>
                     <span className="text-gray-500 text-sm">· {post.createdAt}</span>
                   </div>
                </div>
                {post.user.id !== currentUserId && (
                  isFollowed ? (
                    <button onClick={() => onFollowToggle(post.user.id)} className="flex items-center justify-center text-sm px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
                      <CheckIcon />
                      <span className="ml-1">Following</span>
                    </button>
                  ) : (
                    <button onClick={() => onFollowToggle(post.user.id)} className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Follow
                    </button>
                  )
                )}
              </div>
            </div>
            {post.user.id === currentUserId ? (
              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full">
                  <MoreHorizIcon />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                    <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <EditIcon /> <span>Edit Post</span>
                    </button>
                    <button onClick={handleDelete} className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <TrashIcon /> <span>Delete Post</span>
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 bg-gray-100 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button onClick={handleCancelEdit} className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                <button onClick={handleSaveEdit} className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white hover:bg-blue-600">Save</button>
              </div>
            </div>
          ) : (
            <>
              {post.content && (
                 <div className="mt-1">
                    <p className="whitespace-pre-wrap">{post.content}</p>
                    {showPostTranslation && translatedContent && (
                        <>
                            <hr className="my-2 border-gray-200 dark:border-gray-700" />
                            <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-400 text-sm">{translatedContent}</p>
                        </>
                    )}
                    <button
                        onClick={handleTranslatePost}
                        disabled={isTranslatingPost}
                        className="text-xs text-blue-500 mt-2 flex items-center space-x-1 disabled:opacity-50"
                    >
                        {isTranslatingPost ? (
                          <LoadingIcon className="animate-spin h-4 w-4 text-blue-500" />
                        ) : (
                          <TranslateIcon />
                        )}
                        <span>
                            {isTranslatingPost
                                ? 'Translating...'
                                : showPostTranslation
                                ? 'Hide Translation'
                                : 'Translate'}
                        </span>
                    </button>
                </div>
              )}
              {renderMedia()}
            </>
          )}

          <div className="flex justify-between text-gray-500 mt-4">
            <button onClick={handleLike} className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              {isLiked ? <LikeIconFilled className="text-red-500" /> : <LikeIcon />}
              <span>{likeCount.toLocaleString()}</span>
            </button>
            <button className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <CommentIcon />
              <span>{comments.length.toLocaleString()}</span>
            </button>
            <button onClick={handleShare} className="flex items-center space-x-1 hover:text-green-500 transition-colors">
              <ShareIcon />
              <span>{shareCount.toLocaleString()}</span>
            </button>
             {post.viewers && <span className="text-sm">{post.viewers.toLocaleString()} Viewers</span>}
          </div>
          
          <div className="mt-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <div className="flex items-center space-x-1 text-sm">
                    <span className="font-bold">{comment.user.name}</span>
                    <span className="text-gray-500">@{comment.user.handle}</span>
                  </div>
                  <p className="text-sm mt-1">{comment.translation || comment.text}</p>
                   {comment.translation ? (
                      <button onClick={() => handleShowOriginal(comment.id)} className="text-xs text-blue-500 mt-1">Show original</button>
                    ) : (
                      <button onClick={() => handleTranslateComment(comment.id, comment.text)} disabled={comment.isTranslating} className="text-xs text-blue-500 mt-1 flex items-center space-x-1 disabled:opacity-50">
                        {comment.isTranslating ? <LoadingIcon className="animate-spin h-4 w-4 text-blue-500" /> : <TranslateIcon />}
                        <span>Translate</span>
                      </button>
                    )}
                </div>
              </div>
            ))}
             <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-4">
                <img src={currentUser.avatar} alt="My avatar" className="w-8 h-8 rounded-full" />
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button 
                        type="submit" 
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:text-gray-400 disabled:hover:bg-transparent transition-colors"
                        aria-label="Send comment"
                    >
                        <SendIcon />
                    </button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;