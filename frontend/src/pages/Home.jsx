import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { videoAPI, recommendationAPI } from '../services/api';
import VideoCard from '../components/VideoCard';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent videos
        const videosResponse = await videoAPI.getVideos({ limit: 8 });
        setVideos(videosResponse.data.data.videos);
        
        // Fetch trending videos
        const trendingResponse = await recommendationAPI.getTrending({ limit: 8 });
        setTrendingVideos(trendingResponse.data.data.videos);
      } catch (err) {
        setError('Failed to fetch videos');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to StreamHub</h1>
        <p className="text-xl mb-8">Discover amazing videos from creators around the world</p>
        <button 
          onClick={() => navigate('/signup')}
          className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition-colors"
        >
          Get Started
        </button>
      </motion.div>

      {/* Trending Videos */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Trending Videos</h2>
        {trendingVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingVideos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No trending videos available.</p>
        )}
      </section>

      {/* Recent Videos */}
      <section>
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Recent Uploads</h2>
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No videos available yet.</p>
        )}
      </section>
    </div>
  );
};

export default Home;