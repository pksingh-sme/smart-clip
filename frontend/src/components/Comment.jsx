import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { interactionAPI } from '../services/api';

const Comment = ({ comment }) => {
  const [likeStatus, setLikeStatus] = useState({ liked: false, disliked: false });
  const { user } = useStore();

  const handleLike = async () => {
    if (!user) return;
    
    try {
      await interactionAPI.likeComment(comment.id);
      
      // Update like status
      setLikeStatus(prev => ({
        liked: !prev.liked,
        disliked: false
      }));
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex space-x-3"
    >
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex-shrink-0" />
      
      <div className="flex-grow">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900 dark:text-white mr-2">
              {comment.author_username}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.created_at)}
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300">
            {comment.content}
          </p>
        </div>
        
        <div className="flex items-center mt-2 space-x-4">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 text-sm ${likeStatus.liked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={likeStatus.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{comment.likes_count || 0}</span>
          </button>
          
          <button className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.765a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 16H13m0 0v7m0-7h2" />
            </svg>
            <span>{comment.dislikes_count || 0}</span>
          </button>
          
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Reply
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Comment;