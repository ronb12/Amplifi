import React, { useMemo, useState } from "react";
import { useVideo } from "../contexts/VideoContext";
import { useLiveEvent } from "../contexts/LiveEventContext";
import VideoCard from "../components/VideoCard";
import { FiActivity, FiCalendar, FiCompass, FiSliders, FiUsers, FiZap } from "react-icons/fi";

const HomePage: React.FC = () => {
  const { videos, channels, subscribedChannelIds } = useVideo();
  const { events } = useLiveEvent();
  const [activeFeed, setActiveFeed] = useState("forYou");
  const [discoveryMode, setDiscoveryMode] = useState("balanced");

  const subscribedVideos = videos.filter(video => subscribedChannelIds.includes(video.channelId));
  const newCreatorVideos = useMemo(() => (
    videos.filter(video => {
      const channel = channels.find(item => item.id === video.channelId);
      return channel ? channel.subscribers < 100000 : false;
    })
  ), [channels, videos]);

  const rankedVideos = useMemo(() => (
    [...videos].sort((a, b) => {
      if (discoveryMode === "fresh") return a.views - b.views;
      if (discoveryMode === "deep") return b.comments + b.likes - (a.comments + a.likes);
      return b.views + b.likes * 5 - (a.views + a.likes * 5);
    })
  ), [discoveryMode, videos]);

  const feedVideos = activeFeed === "following"
    ? subscribedVideos
    : activeFeed === "newCreators"
      ? newCreatorVideos
      : rankedVideos;

  const feedOptions = [
    { id: "forYou", label: "For You", icon: FiCompass },
    { id: "following", label: "Following", icon: FiUsers },
    { id: "newCreators", label: "New Creators", icon: FiZap }
  ];

  const liveSoon = events
    .filter(event => !event.isSoldOut)
    .slice(0, 3);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amplifi Home</h1>
          <p className="text-sm text-gray-600">Videos, communities, live events, and creator drops in one feed.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
          {feedOptions.map(option => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => setActiveFeed(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  activeFeed === option.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiSliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Discovery controls</h2>
                <p className="text-sm text-gray-600">Choose how much the feed favors familiar, fresh, or discussion-heavy content.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "balanced", label: "Balanced" },
                { id: "fresh", label: "Boost smaller creators" },
                { id: "deep", label: "Deep discussion" }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setDiscoveryMode(mode.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    discoveryMode === mode.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {feedVideos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm text-center py-16">
              <FiUsers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">Nothing here yet</h2>
              <p className="text-gray-600">Subscribe to creators or switch feeds to discover more.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedVideos.map((video, index) => (
                <div key={video.id} className="space-y-2">
                  <VideoCard video={video} />
                  {activeFeed === "forYou" && index < 6 && (
                    <div className="text-xs text-gray-500 bg-white rounded-lg px-3 py-2 shadow-sm">
                      Recommended because {discoveryMode === "fresh"
                        ? "this boosts smaller channels"
                        : discoveryMode === "deep"
                          ? "viewers are actively discussing it"
                          : "it matches popular creator-learning content"}.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-blue-600" />
              Live Soon
            </h2>
            <div className="space-y-3">
              {liveSoon.map(event => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">{event.creatorName}</p>
                  <p className="text-sm text-blue-700 mt-2">${event.price.toFixed(2)} ticket</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiActivity className="w-4 h-4 text-green-600" />
              Creator Pulse
            </h2>
            <div className="space-y-3">
              {[...channels]
                .sort((a, b) => b.subscribers - a.subscribers)
                .slice(0, 4)
                .map(channel => (
                  <div key={channel.id} className="flex items-center gap-3">
                    <img src={channel.avatar} alt={channel.name} className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                      <p className="text-xs text-gray-500">{channel.subscribers.toLocaleString()} subscribers</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;
