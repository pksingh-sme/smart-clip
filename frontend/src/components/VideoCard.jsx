import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const VideoCard = ({ video }) => {
  const navigate = useNavigate();

  const handleVideoClick = () => {
    navigate(`/video/${video.id}`);
  };

  // Format view count
  const formatViewCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={handleVideoClick}
    >
      {/* Thumbnail */}
      <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <div className="bg-gray-300 border-2 border-dashed rounded-xl w-16 h-16" />
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
          {video.title}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <span>{video.creator_username}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>{formatViewCount(video.views_count)} views</span>
          <span className="mx-2">•</span>
          <span>{formatDate(video.created_at)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;