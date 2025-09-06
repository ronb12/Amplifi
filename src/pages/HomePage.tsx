import React from "react";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";

const HomePage: React.FC = () => {
  const { videos } = useVideo();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Featured Content</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
