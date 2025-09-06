import React from "react";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";

const SubscriptionsPage: React.FC = () => {
  const { videos, channels } = useVideo();

  // Filter videos from subscribed channels (simulating subscriptions)
  const subscribedVideos = videos.filter(video => 
    channels.some(channel => channel.id === video.channelId)
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscriptions</h1>
      
      {subscribedVideos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No subscriptions yet</p>
          <p className="text-gray-500">Subscribe to creators to see their content here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subscribedVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionsPage;
