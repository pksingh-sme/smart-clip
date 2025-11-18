import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      videos: [],
      currentVideo: null,
      
      // Authentication actions
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      setUser: (user) => set({ user }),
      
      // Video actions
      setVideos: (videos) => set({ videos }),
      setCurrentVideo: (video) => set({ currentVideo: video }),
      addVideo: (video) => set((state) => ({ videos: [...state.videos, video] })),
      updateVideo: (updatedVideo) => set((state) => ({
        videos: state.videos.map(video => 
          video.id === updatedVideo.id ? updatedVideo : video
        )
      })),
      removeVideo: (videoId) => set((state) => ({
        videos: state.videos.filter(video => video.id !== videoId)
      })),
      
      // Utility actions
      clearStore: () => set({ user: null, token: null, videos: [], currentVideo: null }),
    }),
    {
      name: 'streamhub-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ user: state.user, token: state.token }), // only persist user and token
    }
  )
);

export { useStore };