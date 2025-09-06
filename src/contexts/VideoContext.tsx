import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  timestamp: string;
  duration: string;
  likes: number;
  dislikes: number;
  comments: number;
  videoUrl: string;
  isPayPerView?: boolean;
  payPerViewPrice?: number;
  isExclusive?: boolean;
  exclusiveTier?: string;
  earlyAccess?: boolean;
}

export interface Channel {
  id: string;
  name: string;
  avatar: string;
  subscribers: number;
  videos: number;
  description: string;
}

interface VideoContextType {
  videos: Video[];
  channels: Channel[];
  currentVideo: Video | null;
  setCurrentVideo: (video: Video | null) => void;
  addVideo: (video: Video) => void;
  addChannel: (channel: Channel) => void;
  searchVideos: (query: string) => Video[];
  unlockPayPerViewVideo: (videoId: string, userId: string) => Promise<boolean>;
  checkVideoAccess: (videoId: string, userId: string, userTier?: string) => boolean;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
};

interface VideoProviderProps {
  children: ReactNode;
}

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>([
    {
      id: '1',
      title: 'Building a Social Media Platform with React & TypeScript',
      description: 'Learn how to build a complete social media platform from scratch using modern web technologies.',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      channelId: '1',
      channelName: 'CodeMaster Pro',
      channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      views: 125000,
      timestamp: '2 days ago',
      duration: '15:30',
      likes: 5400,
      dislikes: 120,
      comments: 890,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: '2',
      title: 'Advanced CSS Grid Layouts',
      description: 'Master CSS Grid with practical examples and real-world projects.',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      channelId: '2',
      channelName: 'CSS Wizard',
      channelAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      views: 89000,
      timestamp: '1 week ago',
      duration: '22:15',
      likes: 3200,
      dislikes: 85,
      comments: 456,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: '3',
      title: 'JavaScript ES6+ Features You Need to Know',
      description: 'Explore modern JavaScript features that will make you a better developer.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      channelId: '3',
      channelName: 'JS Ninja',
      channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      views: 210000,
      timestamp: '3 days ago',
      duration: '18:45',
      likes: 7800,
      dislikes: 200,
      comments: 1200,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: '4',
      title: 'React Performance Optimization Tips',
      description: 'Learn how to make your React apps lightning fast with these optimization techniques.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      channelId: '1',
      channelName: 'CodeMaster Pro',
      channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      views: 156000,
      timestamp: '5 days ago',
      duration: '25:10',
      likes: 6500,
      dislikes: 150,
      comments: 780,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    },
    {
      id: '5',
      title: 'Exclusive: Advanced React Patterns (Premium Content)',
      description: 'Premium content only for VIP supporters. Learn advanced React patterns used by top companies.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400',
      channelId: '1',
      channelName: 'CodeMaster Pro',
      channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      views: 45000,
      timestamp: '1 day ago',
      duration: '32:15',
      likes: 2100,
      dislikes: 45,
      comments: 320,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isExclusive: true,
      exclusiveTier: 'premium'
    },
    {
      id: '6',
      title: 'Pay-Per-View: Complete Web Development Course',
      description: 'Comprehensive web development course covering HTML, CSS, JavaScript, and React. One-time purchase.',
      thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400',
      channelId: '1',
      channelName: 'CodeMaster Pro',
      channelAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      views: 12500,
      timestamp: '2 days ago',
      duration: '2:15:30',
      likes: 890,
      dislikes: 23,
      comments: 156,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      isPayPerView: true,
      payPerViewPrice: 19.99
    }
  ]);

  const [channels, setChannels] = useState<Channel[]>([
    {
      id: '1',
      name: 'CodeMaster Pro',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      subscribers: 125000,
      videos: 156,
      description: 'Learn web development from beginner to advanced with practical projects and real-world examples.'
    },
    {
      id: '2',
      name: 'CSS Wizard',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100',
      subscribers: 89000,
      videos: 89,
      description: 'Master CSS and design with creative tutorials and modern techniques.'
    },
    {
      id: '3',
      name: 'JS Ninja',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      subscribers: 210000,
      videos: 234,
      description: 'Become a JavaScript expert with advanced tutorials and practical examples.'
    }
  ]);

  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  const addVideo = (video: Video) => {
    setVideos(prev => [...prev, video]);
  };

  const addChannel = (channel: Channel) => {
    setChannels(prev => [...prev, channel]);
  };

  const searchVideos = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return videos.filter(video =>
      video.title.toLowerCase().includes(lowercaseQuery) ||
      video.description.toLowerCase().includes(lowercaseQuery) ||
      video.channelName.toLowerCase().includes(lowercaseQuery)
    );
  };

  const unlockPayPerViewVideo = async (videoId: string, userId: string): Promise<boolean> => {
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation, this would verify payment with Stripe
      return true;
    } catch (error) {
      return false;
    }
  };

  const checkVideoAccess = (videoId: string, userId: string, userTier?: string): boolean => {
    const video = videos.find(v => v.id === videoId);
    if (!video) return false;

    // Free videos are always accessible
    if (!video.isExclusive && !video.isPayPerView) return true;

    // Check exclusive content access
    if (video.isExclusive && video.exclusiveTier) {
      const tierHierarchy = ['basic', 'premium', 'vip', 'elite'];
      const userTierIndex = tierHierarchy.indexOf(userTier || '');
      const requiredTierIndex = tierHierarchy.indexOf(video.exclusiveTier);
      
      return userTierIndex >= requiredTierIndex;
    }

    // Pay-per-view videos require purchase (simplified for demo)
    if (video.isPayPerView) {
      // In real implementation, check if user has purchased this video
      return false;
    }

    return false;
  };

  const value: VideoContextType = {
    videos,
    channels,
    currentVideo,
    setCurrentVideo,
    addVideo,
    addChannel,
    searchVideos,
    unlockPayPerViewVideo,
    checkVideoAccess
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};
