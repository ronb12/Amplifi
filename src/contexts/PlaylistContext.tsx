import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Video } from './VideoContext';
import { loadState, saveState, storageKeys } from '../services/storage';

export interface Playlist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelName: string;
  videoCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  videos: PlaylistVideo[];
}

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channelName: string;
  views: number;
  timestamp: string;
  addedAt: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  createPlaylist: (playlistData: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'videos'>) => Playlist;
  addVideoToPlaylist: (playlistId: string, video: Video) => void;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  updatePlaylist: (playlistId: string, updates: Partial<Playlist>) => void;
  deletePlaylist: (playlistId: string) => void;
  getPlaylistById: (id: string) => Playlist | undefined;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylist must be used within PlaylistProvider');
  }
  return context;
};

interface PlaylistProviderProps {
  children: ReactNode;
}

const defaultPlaylists: Playlist[] = [
  {
    id: '1',
    title: 'Programming Tutorials',
    description: 'Learn programming from beginner to advanced',
    thumbnail: '/amplifi-logo.svg',
    channelId: '1',
    channelName: 'CodeMaster Pro',
    videoCount: 3,
    isPublic: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    videos: [
      {
        id: '1',
        title: 'Building a Social Media Platform with React & TypeScript',
        thumbnail: '/amplifi-logo.svg',
        duration: '15:30',
        channelName: 'CodeMaster Pro',
        views: 125000,
        timestamp: '2 days ago',
        addedAt: '2024-01-10'
      },
      {
        id: '2',
        title: 'Advanced CSS Grid Layouts',
        thumbnail: '/amplifi-logo.svg',
        duration: '22:15',
        channelName: 'CSS Wizard',
        views: 89000,
        timestamp: '1 week ago',
        addedAt: '2024-01-12'
      },
      {
        id: '3',
        title: 'JavaScript ES6+ Features You Need to Know',
        thumbnail: '/amplifi-logo.svg',
        duration: '18:45',
        channelName: 'JS Ninja',
        views: 210000,
        timestamp: '3 days ago',
        addedAt: '2024-01-14'
      }
    ]
  },
  {
    id: '2',
    title: 'Web Development Tips',
    description: 'Quick tips and tricks for web developers',
    thumbnail: '/amplifi-logo.svg',
    channelId: '2',
    channelName: 'CSS Wizard',
    videoCount: 2,
    isPublic: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-12',
    videos: [
      {
        id: '2',
        title: 'Advanced CSS Grid Layouts',
        thumbnail: '/amplifi-logo.svg',
        duration: '22:15',
        channelName: 'CSS Wizard',
        views: 89000,
        timestamp: '1 week ago',
        addedAt: '2024-01-05'
      },
      {
        id: '4',
        title: 'Modern JavaScript Patterns',
        thumbnail: '/amplifi-logo.svg',
        duration: '25:10',
        channelName: 'JS Ninja',
        views: 156000,
        timestamp: '5 days ago',
        addedAt: '2024-01-10'
      }
    ]
  }
];

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ children }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => loadState(storageKeys.playlists, defaultPlaylists));
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);

  useEffect(() => saveState(storageKeys.playlists, playlists), [playlists]);

  const createPlaylist = (playlistData: Omit<Playlist, 'id' | 'createdAt' | 'updatedAt' | 'videos'>) => {
    const newPlaylist: Playlist = {
      ...playlistData,
      id: `playlist_${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      videos: []
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const addVideoToPlaylist = (playlistId: string, video: Video) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        if (playlist.videos.some(existingVideo => existingVideo.id === video.id)) {
          return playlist;
        }

        const playlistVideo: PlaylistVideo = {
          id: video.id,
          title: video.title,
          thumbnail: video.thumbnail,
          duration: video.duration,
          channelName: video.channelName,
          views: video.views,
          timestamp: video.timestamp,
          addedAt: new Date().toISOString().split('T')[0]
        };

        const updatedVideos = [...playlist.videos, playlistVideo];
        return {
          ...playlist,
          videos: updatedVideos,
          videoCount: updatedVideos.length,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return playlist;
    }));
  };

  const removeVideoFromPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        const updatedVideos = playlist.videos.filter(video => video.id !== videoId);
        return {
          ...playlist,
          videos: updatedVideos,
          videoCount: updatedVideos.length,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return playlist;
    }));
  };

  const updatePlaylist = (playlistId: string, updates: Partial<Playlist>) => {
    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return playlist;
    }));
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  const getPlaylistById = (id: string) => {
    return playlists.find(playlist => playlist.id === id);
  };

  const value: PlaylistContextType = {
    playlists,
    currentPlaylist,
    setCurrentPlaylist,
    createPlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
    getPlaylistById
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
};
