import React from "react";
import { FiClock, FiThumbsUp, FiPlay } from "react-icons/fi";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";

const LibraryPage: React.FC = () => {
  const { videos, likedVideoIds, savedVideoIds } = useVideo();
  const likedVideos = videos.filter(video => likedVideoIds.includes(video.id));
  const savedVideos = videos.filter(video => savedVideoIds.includes(video.id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Library</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiClock className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">History</h3>
          </div>
          <p className="text-gray-600 mb-4">Watch history and recently viewed videos</p>
          <button className="btn-secondary w-full">View History</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiThumbsUp className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Liked content</h3>
          </div>
          <p className="text-gray-600 mb-4">Content you have liked</p>
          <button className="btn-secondary w-full">View Liked</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <FiPlay className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Playlists</h3>
          </div>
          <p className="text-gray-600 mb-4">Your created and saved playlists</p>
          <button className="btn-secondary w-full">View Playlists</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FiClock className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Watch later</h3>
          </div>
          <p className="text-gray-600 mb-4">Videos saved to watch later</p>
          <button className="btn-secondary w-full">View Watch Later</button>
        </div>
      </div>

      {savedVideos.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedVideos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </section>
      )}

      {likedVideos.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Liked content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedVideos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default LibraryPage;
