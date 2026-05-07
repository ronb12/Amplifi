import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from 'react-router-dom';
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
import SettingsPage from './pages/SettingsPage';
import StoriesPage from './pages/StoriesPage';
import AdminPage from './pages/AdminPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdvertiserDashboardPage from './pages/AdvertiserDashboardPage';
import CreatorDashboard from './components/CreatorDashboard';
import { VideoProvider } from './contexts/VideoContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PlaylistProvider } from './contexts/PlaylistContext';
import { AdProvider } from './contexts/AdContext';
import { LiveEventProvider } from './contexts/LiveEventContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm font-medium text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

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
                        <Route path="/subscriptions" element={<ProtectedRoute><SubscriptionsPage /></ProtectedRoute>} />
                        <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
                        <Route path="/history" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
                        <Route path="/liked" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
                        <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
                        <Route path="/shorts" element={<StoriesPage />} />
                        <Route path="/stories" element={<StoriesPage />} />
                        <Route path="/live-events" element={<ProtectedRoute><LiveEventsPage /></ProtectedRoute>} />
                        <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                        <Route path="/advertiser-dashboard" element={<ProtectedRoute><AdvertiserDashboardPage /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
                        <Route path="/admin/reports" element={<ProtectedRoute requireAdmin><AdminReportsPage /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                        <Route path="*" element={<HomePage />} />
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
