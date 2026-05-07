import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { loadState, saveState, storageKeys } from '../services/storage';

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
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  savedVideoIds: string[];
  subscribedChannelIds: string[];
  purchasedVideoIds: string[];
  setCurrentVideo: (video: Video | null) => void;
  addVideo: (video: Video) => void;
  addChannel: (channel: Channel) => void;
  toggleLike: (videoId: string) => void;
  toggleDislike: (videoId: string) => void;
  toggleSave: (videoId: string) => void;
  toggleSubscribe: (channelId: string) => void;
  recordView: (videoId: string) => void;
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

const defaultVideos: Video[] = [
  {
    id: '1',
    title: 'Building a Social Media Platform with React & TypeScript',
    description: 'Learn how to build a complete social media platform from scratch using modern web technologies.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '1',
    channelName: 'CodeMaster Pro',
    channelAvatar: '/amplifi-logo.svg',
    views: 125000,
    timestamp: '2 days ago',
    duration: '15:30',
    likes: 5400,
    dislikes: 120,
    comments: 890,
    videoUrl: ''
  },
  {
    id: '2',
    title: 'Advanced CSS Grid Layouts',
    description: 'Master CSS Grid with practical examples and real-world projects.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '2',
    channelName: 'CSS Wizard',
    channelAvatar: '/amplifi-logo.svg',
    views: 89000,
    timestamp: '1 week ago',
    duration: '22:15',
    likes: 3200,
    dislikes: 85,
    comments: 456,
    videoUrl: ''
  },
  {
    id: '3',
    title: 'JavaScript ES6+ Features You Need to Know',
    description: 'Explore modern JavaScript features that will make you a better developer.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '3',
    channelName: 'JS Ninja',
    channelAvatar: '/amplifi-logo.svg',
    views: 210000,
    timestamp: '3 days ago',
    duration: '18:45',
    likes: 7800,
    dislikes: 200,
    comments: 1200,
    videoUrl: ''
  },
  {
    id: '4',
    title: 'React Performance Optimization Tips',
    description: 'Learn how to make your React apps lightning fast with these optimization techniques.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '1',
    channelName: 'CodeMaster Pro',
    channelAvatar: '/amplifi-logo.svg',
    views: 156000,
    timestamp: '5 days ago',
    duration: '25:10',
    likes: 6500,
    dislikes: 150,
    comments: 780,
    videoUrl: ''
  },
  {
    id: '5',
    title: 'Exclusive: Advanced React Patterns (Premium Content)',
    description: 'Premium content only for VIP supporters. Learn advanced React patterns used by top companies.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '1',
    channelName: 'CodeMaster Pro',
    channelAvatar: '/amplifi-logo.svg',
    views: 45000,
    timestamp: '1 day ago',
    duration: '32:15',
    likes: 2100,
    dislikes: 45,
    comments: 320,
    videoUrl: '',
    isExclusive: true,
    exclusiveTier: 'premium'
  },
  {
    id: '6',
    title: 'Pay-Per-View: Complete Web Development Course',
    description: 'Comprehensive web development course covering HTML, CSS, JavaScript, and React. One-time purchase.',
    thumbnail: '/amplifi-logo.svg',
    channelId: '1',
    channelName: 'CodeMaster Pro',
    channelAvatar: '/amplifi-logo.svg',
    views: 12500,
    timestamp: '2 days ago',
    duration: '2:15:30',
    likes: 890,
    dislikes: 23,
    comments: 156,
    videoUrl: '',
    isPayPerView: true,
    payPerViewPrice: 19.99
  }
];

const defaultChannels: Channel[] = [
  {
    id: '1',
    name: 'CodeMaster Pro',
    avatar: '/amplifi-logo.svg',
    subscribers: 125000,
    videos: 156,
    description: 'Learn web development from beginner to advanced with practical projects and real-world examples.'
  },
  {
    id: '2',
    name: 'CSS Wizard',
    avatar: '/amplifi-logo.svg',
    subscribers: 89000,
    videos: 89,
    description: 'Master CSS and design with creative tutorials and modern techniques.'
  },
  {
    id: '3',
    name: 'JS Ninja',
    avatar: '/amplifi-logo.svg',
    subscribers: 210000,
    videos: 234,
    description: 'Become a JavaScript expert with advanced tutorials and practical examples.'
  }
];

interface VideoInteractions {
  likedVideoIds: string[];
  dislikedVideoIds: string[];
  savedVideoIds: string[];
  subscribedChannelIds: string[];
  purchasedVideoIds: string[];
}

const defaultInteractions: VideoInteractions = {
  likedVideoIds: [],
  dislikedVideoIds: [],
  savedVideoIds: [],
  subscribedChannelIds: [],
  purchasedVideoIds: []
};

export const VideoProvider: React.FC<VideoProviderProps> = ({ children }) => {
  const [videos, setVideos] = useState<Video[]>(() => loadState(storageKeys.videos, defaultVideos));
  const [channels, setChannels] = useState<Channel[]>(() => loadState(storageKeys.channels, defaultChannels));
  const [interactions, setInteractions] = useState<VideoInteractions>(() =>
    loadState(storageKeys.videoInteractions, defaultInteractions)
  );
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);

  useEffect(() => saveState(storageKeys.videos, videos), [videos]);
  useEffect(() => saveState(storageKeys.channels, channels), [channels]);
  useEffect(() => saveState(storageKeys.videoInteractions, interactions), [interactions]);

  const addVideo = (video: Video) => {
    setVideos(prev => [...prev, video]);
  };

  const addChannel = (channel: Channel) => {
    setChannels(prev => [...prev, channel]);
  };

  const toggleLike = (videoId: string) => {
    const wasLiked = interactions.likedVideoIds.includes(videoId);
    const wasDisliked = interactions.dislikedVideoIds.includes(videoId);

    setInteractions(prev => ({
      ...prev,
      likedVideoIds: wasLiked ? prev.likedVideoIds.filter(id => id !== videoId) : [...prev.likedVideoIds, videoId],
      dislikedVideoIds: prev.dislikedVideoIds.filter(id => id !== videoId)
    }));
    setVideos(prev => prev.map(video => video.id === videoId ? {
      ...video,
      likes: Math.max(0, video.likes + (wasLiked ? -1 : 1)),
      dislikes: Math.max(0, video.dislikes + (wasDisliked ? -1 : 0))
    } : video));
  };

  const toggleDislike = (videoId: string) => {
    const wasLiked = interactions.likedVideoIds.includes(videoId);
    const wasDisliked = interactions.dislikedVideoIds.includes(videoId);

    setInteractions(prev => ({
      ...prev,
      likedVideoIds: prev.likedVideoIds.filter(id => id !== videoId),
      dislikedVideoIds: wasDisliked
        ? prev.dislikedVideoIds.filter(id => id !== videoId)
        : [...prev.dislikedVideoIds, videoId]
    }));
    setVideos(prev => prev.map(video => video.id === videoId ? {
      ...video,
      likes: Math.max(0, video.likes + (wasLiked ? -1 : 0)),
      dislikes: Math.max(0, video.dislikes + (wasDisliked ? -1 : 1))
    } : video));
  };

  const toggleSave = (videoId: string) => {
    setInteractions(prev => ({
      ...prev,
      savedVideoIds: prev.savedVideoIds.includes(videoId)
        ? prev.savedVideoIds.filter(id => id !== videoId)
        : [...prev.savedVideoIds, videoId]
    }));
  };

  const toggleSubscribe = (channelId: string) => {
    const wasSubscribed = interactions.subscribedChannelIds.includes(channelId);
    setInteractions(prev => ({
      ...prev,
      subscribedChannelIds: wasSubscribed
        ? prev.subscribedChannelIds.filter(id => id !== channelId)
        : [...prev.subscribedChannelIds, channelId]
    }));
    setChannels(prev => prev.map(channel => channel.id === channelId ? {
      ...channel,
      subscribers: Math.max(0, channel.subscribers + (wasSubscribed ? -1 : 1))
    } : channel));
  };

  const recordView = (videoId: string) => {
    setVideos(prev => prev.map(video => video.id === videoId ? { ...video, views: video.views + 1 } : video));
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
      setInteractions(prev => ({
        ...prev,
        purchasedVideoIds: prev.purchasedVideoIds.includes(videoId)
          ? prev.purchasedVideoIds
          : [...prev.purchasedVideoIds, videoId]
      }));
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
    if (video.isPayPerView) return interactions.purchasedVideoIds.includes(videoId);

    return false;
  };

  const value: VideoContextType = {
    videos,
    channels,
    currentVideo,
    likedVideoIds: interactions.likedVideoIds,
    dislikedVideoIds: interactions.dislikedVideoIds,
    savedVideoIds: interactions.savedVideoIds,
    subscribedChannelIds: interactions.subscribedChannelIds,
    purchasedVideoIds: interactions.purchasedVideoIds,
    setCurrentVideo,
    addVideo,
    addChannel,
    toggleLike,
    toggleDislike,
    toggleSave,
    toggleSubscribe,
    recordView,
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
