import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiMic, FiVideo, FiBell, FiUser, FiLogOut } from "react-icons/fi";
import { useVideo } from "../contexts/VideoContext";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import VideoUpload from "./VideoUpload";
import LiveStream from "./LiveStream";

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showLiveStream, setShowLiveStream] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const navigate = useNavigate();
  const { searchVideos } = useVideo();
  const { user, isAuthenticated, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleLogoClick}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Amplifi</span>
        </button>
        
        {isAuthenticated && (
          <button
            onClick={() => navigate('/creator-dashboard')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Creator Studio
          </button>
        )}
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 h-full px-4 bg-gray-100 hover:bg-gray-200 rounded-r-full transition-colors"
          >
            <FiSearch className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </form>

      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <button 
            onClick={() => setShowLiveStream(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Go Live"
          >
            <FiMic className="w-5 h-5 text-gray-600" />
          </button>
        )}
        {isAuthenticated && (
          <button 
            onClick={() => setShowVideoUpload(true)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Upload Video"
          >
            <FiVideo className="w-5 h-5 text-gray-600" />
          </button>
        )}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <FiBell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <img 
                src={user?.avatar} 
                alt={user?.displayName}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-gray-500">{user?.username}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
              title="Sign Out"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
    
    <AuthModal 
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      initialMode={authMode}
    />
    
    <VideoUpload
      isOpen={showVideoUpload}
      onClose={() => setShowVideoUpload(false)}
    />
    
    <LiveStream
      isOpen={showLiveStream}
      onClose={() => setShowLiveStream(false)}
    />
    </>
  );
};

export default Header;
