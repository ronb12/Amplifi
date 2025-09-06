import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiThumbsUp, FiThumbsDown, FiShare, FiSave, FiMoreVertical } from "react-icons/fi";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";
import TipButton from "../components/TipButton";
import SubscriptionButton from "../components/SubscriptionButton";
import Comments from "../components/Comments";

const VideoPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { videos, channels, setCurrentVideo } = useVideo();
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showComments, setShowComments] = useState(true);

  const video = videos.find(v => v.id === videoId);
  const channel = video ? channels.find(c => c.id === video.channelId) : null;

  useEffect(() => {
    if (video) {
      setCurrentVideo(video);
    }
  }, [video, setCurrentVideo]);

  if (!video || !channel) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Video not found</h1>
      </div>
    );
  }

  const handleLike = () => {
    if (liked) {
      setLiked(false);
    } else {
      setLiked(true);
      setDisliked(false);
    }
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
    } else {
      setDisliked(true);
      setLiked(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatSubscribers = (subscribers: number): string => {
    if (subscribers >= 1000000) {
      return `${(subscribers / 1000000).toFixed(1)}M`;
    } else if (subscribers >= 1000) {
      return `${(subscribers / 1000).toFixed(1)}K`;
    }
    return subscribers.toString();
  };

  return (
    <div className="flex space-x-6 p-6">
      <div className="flex-1">
        {/* Video Player */}
        <div className="bg-black rounded-lg mb-4">
          <video
            src={video.videoUrl}
            controls
            className="w-full h-96 object-contain"
            poster={video.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h1>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{formatViews(video.views)} views</span>
              <span>•</span>
              <span>{video.timestamp}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  liked ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiThumbsUp className="w-5 h-5" />
                <span>{video.likes}</span>
              </button>
              
              <button
                onClick={handleDislike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  disliked ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiThumbsDown className="w-5 h-5" />
                <span>{video.dislikes}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors">
                <FiShare className="w-5 h-5" />
                <span>Share</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors">
                <FiSave className="w-5 h-5" />
                <span>Save</span>
              </button>
              
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors">
                <FiMoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Channel Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
          <div className="flex items-center space-x-3">
            <img 
              src={channel.avatar} 
              alt={channel.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-medium text-gray-900">{channel.name}</h3>
              <p className="text-sm text-gray-600">
                {formatSubscribers(channel.subscribers)} subscribers • {channel.videos} videos
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TipButton creatorId={channel.id} creatorName={channel.name} />
            <SubscriptionButton creatorId={channel.id} creatorName={channel.name} />
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-900 whitespace-pre-wrap">{video.description}</p>
        </div>

        {/* Comments */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {video.comments} Comments
            </h3>
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-gray-600 hover:text-gray-900"
            >
              {showComments ? "Hide" : "Show"} comments
            </button>
          </div>
          
          {showComments && <Comments videoId={video.id} />}
        </div>
      </div>

              {/* Related Content */}
      <div className="w-80 space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Related content</h3>
        {videos
          .filter(v => v.id !== videoId)
          .slice(0, 5)
          .map((relatedVideo) => (
            <VideoCard key={relatedVideo.id} video={relatedVideo} horizontal />
          ))}
      </div>
    </div>
  );
};

export default VideoPage;
