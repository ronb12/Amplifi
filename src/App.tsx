import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import ChannelPage from './pages/ChannelPage';
import SearchPage from './pages/SearchPage';
import TrendingPage from './pages/TrendingPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import LibraryPage from './pages/LibraryPage';
import PlaylistsPage from './pages/PlaylistsPage';
import LiveEventsPage from './pages/LiveEventsPage';
import CreatorDashboard from './components/CreatorDashboard';
import { VideoProvider } from './contexts/VideoContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { AdProvider } from './contexts/AdContext';
import { LiveEventProvider } from './contexts/LiveEventContext';

function App() {
  return (
    <AuthProvider>
      <VideoProvider>
        <PlaylistProvider>
          <AdProvider>
            <LiveEventProvider>
              <Router>
        <div className="flex h-screen bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/video/:videoId" element={<VideoPage />} />
                <Route path="/channel/:channelId" element={<ChannelPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/trending" element={<TrendingPage />} />
                                        <Route path="/subscriptions" element={<SubscriptionsPage />} />
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route path="/live-events" element={<LiveEventsPage />} />
                        <Route path="/creator-dashboard" element={<CreatorDashboard />} />
              </Routes>
            </main>
          </div>
        </div>
        <Toaster position="top-right" />
      </Router>
            </LiveEventProvider>
          </AdProvider>
        </PlaylistProvider>
      </VideoProvider>
    </AuthProvider>
  );
}

export default App;
