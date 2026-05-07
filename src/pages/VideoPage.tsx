import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiFlag, FiLock, FiThumbsDown, FiThumbsUp, FiShare, FiSave } from "react-icons/fi";
import { useVideo } from "../contexts/VideoContext";
import { useAuth } from "../contexts/AuthContext";
import { useAd, type Ad } from "../contexts/AdContext";
import VideoCard from "../components/VideoCard";
import TipButton from "../components/TipButton";
import SubscriptionButton from "../components/SubscriptionButton";
import Comments from "../components/Comments";
import { loadState, saveState, storageKeys } from "../services/storage";

const VideoPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const {
    videos,
    channels,
    likedVideoIds,
    dislikedVideoIds,
    savedVideoIds,
    setCurrentVideo,
    toggleLike,
    toggleDislike,
    toggleSave,
    recordView,
    unlockPayPerViewVideo,
    checkVideoAccess
  } = useVideo();
  const { user } = useAuth();
  const { selectAdForVideo, recordImpression, recordClick, recordWatchThrough, isBrandSafeVideo } = useAd();
  const [showComments, setShowComments] = useState(true);
  const [preRollAd, setPreRollAd] = useState<Ad | null>(null);
  const [bannerAd, setBannerAd] = useState<Ad | null>(null);
  const viewedVideoId = useRef<string | null>(null);

  const video = videos.find(v => v.id === videoId);
  const channel = video ? channels.find(c => c.id === video.channelId) : null;
  const liked = video ? likedVideoIds.includes(video.id) : false;
  const disliked = video ? dislikedVideoIds.includes(video.id) : false;
  const saved = video ? savedVideoIds.includes(video.id) : false;
  const hasAccess = video ? checkVideoAccess(video.id, user?.id || "guest", "premium") : false;

  useEffect(() => {
    if (video) {
      setCurrentVideo(video);
      if (viewedVideoId.current !== video.id) {
        recordView(video.id);
        viewedVideoId.current = video.id;
      }
    }
  }, [video, recordView, setCurrentVideo]);

  useEffect(() => {
    if (!video || !isBrandSafeVideo(video)) {
      setPreRollAd(null);
      setBannerAd(null);
      return;
    }

    const nextPreRoll = selectAdForVideo("pre-roll", video);
    const nextBanner = selectAdForVideo("banner", video) ?? selectAdForVideo("sponsored-card", video);
    setPreRollAd(nextPreRoll);
    setBannerAd(nextBanner);
    if (nextPreRoll) {
      recordImpression(nextPreRoll.id, video);
    }
    if (nextBanner) {
      recordImpression(nextBanner.id, video);
    }
  }, [video?.id]);

  if (!video || !channel) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Video not found</h1>
      </div>
    );
  }

  const handleLike = () => {
    toggleLike(video.id);
  };

  const handleDislike = () => {
    toggleDislike(video.id);
  };

  const handleSave = () => {
    toggleSave(video.id);
    toast.success(saved ? "Removed from saved videos" : "Saved to your library");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: video.title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    toast.success("Video link copied");
  };

  const handleReport = () => {
    const reports = loadState<Array<{ id: string; type: string; contentId: string; reason: string; createdAt: string }>>(
      storageKeys.reports,
      []
    );
    saveState(storageKeys.reports, [
      {
        id: `report_${Date.now()}`,
        type: "video",
        contentId: video.id,
        reason: "viewer-report",
        createdAt: new Date().toISOString()
      },
      ...reports
    ]);
    toast.success("Report submitted for review");
  };

  const handleUnlock = async () => {
    const success = await unlockPayPerViewVideo(video.id, user?.id || "guest");
    if (success) {
      toast.success("Video unlocked");
    }
  };

  const handleAdClick = (ad: Ad) => {
    recordClick(ad.id, video);
    window.open(ad.clickUrl, "_blank", "noopener,noreferrer");
  };

  const handleAdComplete = (ad: Ad) => {
    recordWatchThrough(ad.id, video);
    setPreRollAd(null);
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
        <div className="bg-black rounded-lg mb-4 min-h-96 flex items-center justify-center overflow-hidden">
          {preRollAd ? (
            <div className="w-full h-96 bg-gray-950 text-white flex flex-col items-center justify-center p-8 text-center">
              <span className="mb-3 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                Sponsored
              </span>
              <img src={preRollAd.thumbnail} alt="" className="w-16 h-16 mb-4" />
              <h2 className="text-2xl font-bold mb-2">{preRollAd.title}</h2>
              <p className="max-w-xl text-gray-300 mb-6">{preRollAd.description}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => handleAdClick(preRollAd)} className="btn-primary">
                  Learn more
                </button>
                <button onClick={() => handleAdComplete(preRollAd)} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">
                  Skip ad
                </button>
              </div>
            </div>
          ) : hasAccess ? (
            <video
              src={video.videoUrl}
              controls
              className="w-full h-96 object-contain"
              poster={video.thumbnail}
              onEnded={() => bannerAd && recordWatchThrough(bannerAd.id, video)}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center text-white p-8">
              <FiLock className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Premium content</h2>
              <p className="text-gray-300 mb-4">
                {video.isPayPerView
                  ? `Unlock this video for $${video.payPerViewPrice?.toFixed(2)}.`
                  : `Join the ${video.exclusiveTier} tier to watch this video.`}
              </p>
              {video.isPayPerView && (
                <button onClick={handleUnlock} className="btn-primary">
                  Unlock video
                </button>
              )}
            </div>
          )}
        </div>

        {bannerAd && (
          <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700">Sponsored by {bannerAd.advertiser}</p>
              <h2 className="font-semibold text-blue-950">{bannerAd.title}</h2>
              <p className="text-sm text-blue-800">{bannerAd.description}</p>
            </div>
            <button onClick={() => handleAdClick(bannerAd)} className="btn-primary flex-shrink-0">
              Visit sponsor
            </button>
          </div>
        )}

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
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors"
              >
                <FiShare className="w-5 h-5" />
                <span>Share</span>
              </button>
              
              <button
                onClick={handleSave}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  saved ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <FiSave className="w-5 h-5" />
                <span>{saved ? "Saved" : "Save"}</span>
              </button>
              
              <button
                onClick={handleReport}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 rounded-full transition-colors"
              >
                <FiFlag className="w-5 h-5" />
                <span>Report</span>
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
