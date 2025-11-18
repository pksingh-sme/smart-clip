import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoAPI, commentAPI, interactionAPI } from '../services/api';
import { useStore } from '../store/useStore';
import Comment from '../components/Comment';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeStatus, setLikeStatus] = useState({ liked: false, disliked: false });
  const [transcript, setTranscript] = useState(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch video details
        const videoResponse = await videoAPI.getVideo(id);
        setVideo(videoResponse.data.data);
        
        // Fetch comments
        const commentsResponse = await commentAPI.getComments(id, { limit: 20 });
        setComments(commentsResponse.data.data.comments);
        
        // Fetch like status if user is logged in
        if (user) {
          const likeResponse = await interactionAPI.getLikeStatus(id, 'video');
          setLikeStatus(likeResponse.data.data);
        }
      } catch (err) {
        setError('Failed to fetch video');
        console.error('Error fetching video:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await interactionAPI.likeVideo(id);
      
      // Update like status
      setLikeStatus(prev => ({
        liked: !prev.liked,
        disliked: false
      }));
      
      // Update video likes count
      setVideo(prev => ({
        ...prev,
        likes_count: prev.liked ? prev.likes_count - 1 : prev.likes_count + 1
      }));
    } catch (err) {
      console.error('Error liking video:', err);
    }
  };

  const handleDislike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    try {
      await interactionAPI.dislikeVideo(id);
      
      // Update like status
      setLikeStatus(prev => ({
        liked: false,
        disliked: !prev.disliked
      }));
      
      // Update video dislikes count
      setVideo(prev => ({
        ...prev,
        dislikes_count: prev.disliked ? prev.dislikes_count - 1 : prev.dislikes_count + 1
      }));
    } catch (err) {
      console.error('Error disliking video:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!newComment.trim()) return;
    
    try {
      const response = await commentAPI.addComment(id, { content: newComment });
      
      // Add new comment to the list
      setComments(prev => [response.data.data, ...prev]);
      
      // Clear comment input
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleTranscriptToggle = async () => {
    if (!showTranscript && !transcript) {
      try {
        const response = await videoAPI.getTranscript(id, 'en');
        setTranscript(response.data.data);
      } catch (err) {
        console.error('Error fetching transcript:', err);
      }
    }
    
    setShowTranscript(!showTranscript);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-black rounded-lg overflow-hidden"
      >
        <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
          {video?.video_url ? (
            <video 
              src={video.video_url} 
              controls 
              className="absolute inset-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="text-white text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p>Video not available</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Video Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{video?.title}</h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-white">{video?.creator_username}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">0 subscribers</p>
            </div>
            <button className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm">
              Subscribe
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${likeStatus.liked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={likeStatus.liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{video?.likes_count || 0}</span>
            </button>
            
            <button 
              onClick={handleDislike}
              className={`flex items-center space-x-1 ${likeStatus.disliked ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={likeStatus.disliked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m0 0v9m0-9h2.765a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 16H13m0 0v7m0-7h2" />
              </svg>
              <span>{video?.dislikes_count || 0}</span>
            </button>
            
            <button 
              onClick={handleTranscriptToggle}
              className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Transcript</span>
            </button>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-gray-700 dark:text-gray-300">{video?.description}</p>
        </div>
      </div>

      {/* Transcript */}
      {showTranscript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transcript</h3>
          {transcript ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{transcript.content}</p>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Transcript not available for this video.</p>
          )}
        </motion.div>
      )}

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Comments ({comments.length})
        </h3>
        
        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="flex space-x-3">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex-shrink-0" />
              <div className="flex-grow">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                ></textarea>
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() => setNewComment('')}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-700 dark:text-gray-300">
              Please <button 
                onClick={() => navigate('/login')} 
                className="text-blue-500 hover:underline"
              >
                login
              </button> to comment
            </p>
          </div>
        )}
        
        {/* Comments List */}
        <div className="space-y-6">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
          
          {comments.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;