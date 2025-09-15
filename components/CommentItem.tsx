import React, { useState } from 'react';
import { Comment, User } from '../src/types';
import { geminiService } from '../services/geminiService';
import LikeAnimation from './LikeAnimation';
import { useTranslation } from '../hooks/useTranslation';
import {
  TranslateIcon,
  LoadingIcon,
  LikeIcon,
  LikeIconFilled,
  EditIcon,
  TrashIcon,
  SendIcon
} from './Icons';

interface CommentItemProps {
  comment: Comment;
  currentUser: User;
  currentUserId: string;
  allComments: Comment[];
  depth: number;
  onUpdateComment: (commentId: string, newText: string) => void;
  onDeleteComment: (commentId: string) => void;
  onAddReply: (parentId: string, text: string) => void;
  onTranslateComment: (commentId: string, text: string) => void;
  onShowOriginal: (commentId: string) => void;
  onViewProfile: (userId: string) => void;
  onLikeComment?: (commentId: string) => void;
  commentLikes?: { [key: string]: number };
  likedComments?: { [key: string]: boolean };
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUser,
  currentUserId,
  allComments,
  depth,
  onUpdateComment,
  onDeleteComment,
  onAddReply,
  onTranslateComment,
  onShowOriginal,
  onViewProfile,
  onLikeComment,
  commentLikes = {},
  likedComments = {}
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  // Get replies to this comment
  const replies = allComments.filter(c => c.parentId === comment.id);
  
  // Complete left alignment: All comments and replies at 0px
  // No indentation at all - rely on separators and reply indicators for hierarchy
  const marginLeft = 0;  // All comments fully left-aligned
  
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== comment.text) {
      onUpdateComment(comment.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(comment.text);
    setIsEditing(false);
  };

  const handleReply = () => {
    setIsReplying(true);
  };

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(comment.id, replyText.trim());
      setReplyText('');
      setIsReplying(false);
    }
  };

  const handleCancelReply = () => {
    setReplyText('');
    setIsReplying(false);
  };

  const handleDelete = () => {
    if (window.confirm(t('confirmDeleteComment') || 'Are you sure you want to delete this comment?')) {
      onDeleteComment(comment.id);
    }
  };

  const handleTranslate = () => {
    onTranslateComment(comment.id, comment.text);
  };

  const handleLike = () => {
    if (onLikeComment) {
      onLikeComment(comment.id);
      
      // Trigger animation
      setIsLikeAnimating(true);
    }
  };

  const handleAnimationComplete = () => {
    setIsLikeAnimating(false);
  };

  return (
    <div className="comment-item" style={{ marginLeft: `${marginLeft}px` }}>
      <div className="flex items-start space-x-3 mb-3">
        <img
          src={comment.user.avatar}
          alt={comment.user.name}
          className="w-8 h-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={() => onViewProfile(comment.user.id)}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm">{comment.user.name}</span>
              {depth > 0 && (
                <span className="text-gray-400 text-xs">• {t('reply')}</span>
              )}
            </div>
            {comment.user.id === currentUserId && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                  title={t('editComment')}
                >
                  <EditIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  title={t('deleteComment')}
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2 text-sm bg-white dark:bg-gray-700 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  {t('save')}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {comment.translation || comment.text}
            </p>
          )}
          
          {!isEditing && (
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center space-x-4">
                {comment.translation ? (
                  <button
                    onClick={() => onShowOriginal(comment.id)}
                    className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {t('showOriginal') || 'Show original'}
                  </button>
                ) : (
                  <button
                    onClick={handleTranslate}
                    disabled={comment.isTranslating}
                    className="text-xs text-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50"
                  >
                    {comment.isTranslating ? t('translating') : t('translate')}
                  </button>
                )}
                
                <button
                  onClick={handleReply}
                  className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                >
                  {t('reply')}
                </button>
                
                {replies.length > 0 && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="text-xs text-gray-500 hover:text-blue-500 transition-colors"
                  >
                    {showReplies ? t('hideReplies') || `Hide ${replies.length} replies` : t('showReplies') || `Show ${replies.length} replies`}
                  </button>
                )}
              </div>
              
              {onLikeComment && (
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 text-xs transition-colors group relative ${
                    likedComments[comment.id] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <div className={`relative transition-all duration-300 ease-out ${
                    isLikeAnimating ? 'scale-125' : 'group-hover:scale-110'
                  }`}>
                    {likedComments[comment.id] ? (
                      <LikeIconFilled className="w-3 h-3 text-red-500 transition-all duration-200" />
                    ) : (
                      <LikeIcon className="w-3 h-3 transition-all duration-200" />
                    )}
                    {/* 爆炸式粒子动画 */}
                    <LikeAnimation 
                      isAnimating={isLikeAnimating} 
                      onAnimationComplete={handleAnimationComplete}
                    />
                  </div>
                  <span className="transition-all duration-200">
                    {commentLikes[comment.id] || 0}
                  </span>
                </button>
              )}
            </div>
          )}
          
          {isReplying && (
            <form onSubmit={handleSubmitReply} className="mt-3">
              <div className="flex items-start space-x-2">
                <img
                  src={currentUser.avatar}
                  alt="My avatar"
                  className="w-6 h-6 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={t('replyToUser', { name: comment.user.name }) || `Reply to ${comment.user.name}...`}
                      className="w-full p-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      type="button"
                      onClick={handleCancelReply}
                      className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim()}
                      className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                    >
                      <SendIcon className="w-3 h-3" />
                      <span>{t('reply')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
          
          {/* Recursively render replies */}
          {showReplies && replies.length > 0 && (
            <div className="mt-3 divide-y divide-gray-100 dark:divide-gray-600">
              {replies.map((reply) => (
                <div key={reply.id} className="pt-3 first:pt-0">
                  <CommentItem
                    comment={reply}
                    currentUser={currentUser}
                    currentUserId={currentUserId}
                    allComments={allComments}
                    depth={depth + 1}
                    onUpdateComment={onUpdateComment}
                    onDeleteComment={onDeleteComment}
                    onAddReply={onAddReply}
                    onTranslateComment={onTranslateComment}
                    onShowOriginal={onShowOriginal}
                    onViewProfile={onViewProfile}
                    onLikeComment={onLikeComment}
                    commentLikes={commentLikes}
                    likedComments={likedComments}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;