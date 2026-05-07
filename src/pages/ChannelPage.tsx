import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useVideo } from "../contexts/VideoContext";
import { useAuth } from "../contexts/AuthContext";
import { useLiveEvent } from "../contexts/LiveEventContext";
import VideoCard from "../components/VideoCard";
import CommunityPosts, { type CommunityPost } from "../components/CommunityPosts";
import { loadState, saveState, storageKeys } from "../services/storage";
import { subscriptionTiers } from "../services/monetization";
import { FiCalendar, FiCheck, FiMessageCircle, FiPackage, FiPlay, FiShoppingBag, FiStar, FiUsers, FiVideo } from "react-icons/fi";

interface ChatMessage {
  id: string;
  channelId: string;
  author: string;
  message: string;
  createdAt: string;
}

const ChannelPage: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { channels, videos, subscribedChannelIds, toggleSubscribe } = useVideo();
  const { events } = useLiveEvent();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("videos");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadState("amplifi:v1:channel-chat", [
      {
        id: "chat_1",
        channelId: "1",
        author: "Community Lead",
        message: "Welcome to the channel hub. Drop questions for the next upload.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ])
  );
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() =>
    loadState(storageKeys.communityPosts, [
      {
        id: "post_1",
        type: "announcement",
        title: "New premium series is live",
        content: "Thanks for helping shape the next wave of Amplifi tutorials. Drop your questions for the follow-up episode.",
        author: {
          id: "1",
          name: "CodeMaster Pro",
          avatar: "/amplifi-logo.svg",
          isCreator: true
        },
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        likes: 128,
        comments: 24,
        shares: 8,
        isPinned: true
      }
    ])
  );

  const channel = channels.find(c => c.id === channelId);
  const channelVideos = videos.filter(v => v.channelId === channelId);
  const channelEvents = events.filter(event => event.creatorId === channelId);
  const subscribed = channelId ? subscribedChannelIds.includes(channelId) : false;
  const channelPosts = communityPosts.filter(post => post.author.id === channelId);
  const channelChat = chatMessages.filter(message => message.channelId === channelId);
  const canPost = Boolean(user?.isCreator && user.channelId === channelId);
  const channelTabs = [
    { id: "videos", label: "Videos" },
    { id: "posts", label: "Posts" },
    { id: "events", label: "Events" },
    { id: "membership", label: "Membership" },
    { id: "store", label: "Store" },
    { id: "chat", label: "Chat" },
    { id: "playlists", label: "Playlists" },
    { id: "about", label: "About" }
  ];
  const storeItems = [
    {
      id: "course",
      title: "Creator Course Bundle",
      description: "A focused learning path with videos, event replays, and downloadable worksheets.",
      price: 49
    },
    {
      id: "template",
      title: "Template Pack",
      description: "Project files, checklists, and creator workflow templates.",
      price: 19
    },
    {
      id: "consult",
      title: "Private Review Session",
      description: "A one-on-one creator feedback session with written notes.",
      price: 149
    }
  ];

  useEffect(() => saveState(storageKeys.communityPosts, communityPosts), [communityPosts]);
  useEffect(() => saveState("amplifi:v1:channel-chat", chatMessages), [chatMessages]);

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

  const sendChatMessage = () => {
    if (!chatInput.trim() || !channelId) return;

    setChatMessages(prev => [
      {
        id: `chat_${Date.now()}`,
        channelId,
        author: user?.displayName || "Guest",
        message: chatInput.trim(),
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
    setChatInput("");
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
          <button
            onClick={() => {
              toggleSubscribe(channel.id);
              toast.success(subscribed ? "Subscription removed" : `Subscribed to ${channel.name}`);
            }}
            className={subscribed ? "btn-secondary" : "btn-primary"}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="p-4 sm:hidden">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="channel-section">
              Channel section
            </label>
            <select
              id="channel-section"
              value={activeTab}
              onChange={(event) => setActiveTab(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {channelTabs.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
          </div>
          <nav className="hidden sm:flex gap-8 px-6 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab("videos")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "videos"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "posts"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "events"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("membership")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "membership"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Membership
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "store"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Store
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "chat"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("playlists")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
                activeTab === "playlists"
                  ? "border-red-600 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-2 border-b-2 font-medium text-sm flex-shrink-0 ${
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

          {activeTab === "events" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Creator Events</h3>
                <FiCalendar className="w-5 h-5 text-gray-400" />
              </div>
              {channelEvents.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No scheduled events yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channelEvents.map(event => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold text-gray-900">{event.title}</p>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
                      <div className="flex items-center justify-between mt-4 text-sm">
                        <span className="text-blue-700 font-medium">${event.price.toFixed(2)}</span>
                        <span className="text-gray-500">{event.currentAttendees}/{event.maxAttendees} attending</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "membership" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Membership Tiers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionTiers.map(tier => (
                  <div key={tier.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <FiStar className="w-4 h-4 text-purple-600" />
                      <p className="font-semibold text-gray-900">{tier.name}</p>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">${tier.price}<span className="text-sm font-normal text-gray-500">/mo</span></p>
                    <div className="space-y-2 mt-4">
                      {tier.benefits.map(benefit => (
                        <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCheck className="w-4 h-4 text-green-600" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => toast.success(`${tier.name} membership selected`)}
                      className="btn-primary w-full mt-5"
                    >
                      Join {tier.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "store" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Creator Store</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {storeItems.map(item => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <FiPackage className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-5">
                      <span className="font-bold text-gray-900">${item.price}</span>
                      <button
                        onClick={() => toast.success(`${item.title} added to checkout`)}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg text-sm"
                      >
                        <FiShoppingBag className="w-4 h-4" />
                        Buy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <FiMessageCircle className="w-5 h-5 text-blue-600" />
                Community Chat
              </h3>
              <div className="flex gap-2 mb-4">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && sendChatMessage()}
                  placeholder="Message the community"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendChatMessage} className="btn-primary">Send</button>
              </div>
              <div className="space-y-3">
                {channelChat.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No messages yet</p>
                ) : channelChat.map(message => (
                  <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{message.author}</p>
                      <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{message.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "posts" && (
            <CommunityPosts
              posts={channelPosts}
              currentUserId={user?.id}
              isCreator={canPost}
              onPostCreate={(post) => {
                setCommunityPosts(prev => [
                  {
                    ...post,
                    id: `post_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    likes: 0,
                    comments: 0,
                    shares: 0,
                    author: {
                      id: channel.id,
                      name: channel.name,
                      avatar: channel.avatar,
                      isCreator: true
                    }
                  },
                  ...prev
                ]);
              }}
              onPostLike={(postId) => {
                setCommunityPosts(prev => prev.map(post =>
                  post.id === postId ? { ...post, likes: post.likes + 1 } : post
                ));
              }}
              onPostComment={(postId) => {
                setCommunityPosts(prev => prev.map(post =>
                  post.id === postId ? { ...post, comments: post.comments + 1 } : post
                ));
                toast.success("Comment added to the discussion");
              }}
              onPostShare={async (postId) => {
                await navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}?post=${postId}`);
                setCommunityPosts(prev => prev.map(post =>
                  post.id === postId ? { ...post, shares: post.shares + 1 } : post
                ));
                toast.success("Post link copied");
              }}
            />
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
