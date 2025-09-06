import React from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiClock, FiThumbsUp, FiThumbsDown, FiMessageCircle } from "react-icons/fi";
import { Video } from "../contexts/VideoContext";

interface VideoCardProps {
  video: Video;
  horizontal?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, horizontal = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/video/${video.id}`);
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (horizontal) {
    return (
      <div 
        className="flex space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        onClick={handleClick}
      >
        <div className="relative flex-shrink-0">
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-40 h-24 object-cover rounded-lg"
          />
          <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
            {video.duration}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {video.channelName}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <FiEye className="w-4 h-4" />
              <span>{formatViews(video.views)} views</span>
            </span>
            <span>{video.timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="video-card p-3"
      onClick={handleClick}
    >
      <div className="relative mb-3">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-32 object-cover rounded-lg"
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      
      <div className="flex space-x-3">
        <img 
          src={video.channelAvatar} 
          alt={video.channelName}
          className="w-9 h-9 rounded-full flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 text-sm">
            {video.title}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {video.channelName}
          </p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{video.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
