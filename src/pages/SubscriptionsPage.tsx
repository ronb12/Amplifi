import React from "react";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";

const SubscriptionsPage: React.FC = () => {
  const { videos, channels, subscribedChannelIds } = useVideo();

  const subscribedVideos = videos.filter(video => 
    subscribedChannelIds.includes(video.channelId)
  );
  const subscribedChannels = channels.filter(channel => subscribedChannelIds.includes(channel.id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Subscriptions</h1>
      {subscribedChannels.length > 0 && (
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {subscribedChannels.map(channel => (
            <div key={channel.id} className="flex items-center gap-2 bg-white rounded-lg shadow-sm px-3 py-2 min-w-max">
              <img src={channel.avatar} alt={channel.name} className="w-8 h-8 rounded-full" />
              <span className="text-sm font-medium text-gray-900">{channel.name}</span>
            </div>
          ))}
        </div>
      )}
      
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
