import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";
import { FiUsers, FiVideo, FiPlay } from "react-icons/fi";

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { channels, videos } = useVideo();
  const [activeTab, setActiveTab] = useState("videos");

  const channel = channels.find(c => c.id === channelId);
  const channelVideos = videos.filter(v => v.channelId === channelId);

  if (!channel) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Channel not found</h1>
      </div>
    );
  }

  const formatSubscribers = (subscribers: number): string => {
    if (subscribers >= 1000000) {
      return `${(subscribers / 1000000).toFixed(1)}M`;
    } else if (subscribers >= 1000) {
      return `${(subscribers / 1000).toFixed(1)}K`;
    }
    return subscribers.toString();
  };

  return (
    <div className="p-6">
      {/* Channel Header */}
      <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center space-x-6">
          <img 
            src={channel.avatar} 
            alt={channel.name}
            className="w-24 h-24 rounded-full"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{channel.name}</h1>
            <p className="text-gray-600 mb-3">{channel.description}</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <FiUsers className="w-4 h-4" />
                <span>{formatSubscribers(channel.subscribers)} subscribers</span>
              </span>
              <span className="flex items-center space-x-1">
                <FiVideo className="w-4 h-4" />
                <span>{channel.videos} videos</span>
              </span>
            </div>
          </div>
          <button className="btn-primary">Subscribe</button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("videos")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "videos"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "playlists"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "about"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              About
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "videos" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Content</h3>
                <div className="flex items-center space-x-2">
                  <FiPlay className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Sort by: Recent</span>
                </div>
              </div>
              
              {channelVideos.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No content uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {channelVideos.map((video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "playlists" && (
            <div className="text-center py-12">
              <p className="text-gray-600">No playlists created yet</p>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600">{channel.description}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatSubscribers(channel.subscribers)}</p>
                    <p className="text-sm text-gray-600">Subscribers</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{channel.videos}</p>
                    <p className="text-sm text-gray-600">Videos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelPage;
