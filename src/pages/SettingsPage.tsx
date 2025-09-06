import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiBell, FiShield, FiMonitor, FiDownload, FiGlobe, FiPalette, FiHelpCircle } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdating, setIsUpdating] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    creatorUpdates: true,
    trendingContent: false,
    liveStreams: true,
    comments: true,
    tips: true
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    allowTips: true,
    allowComments: true,
    analyticsSharing: true
  });

  const [appSettings, setAppSettings] = useState({
    theme: 'system',
    language: 'en',
    autoPlay: true,
    quality: 'auto',
    subtitles: 'off'
  });

  const handleProfileUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInstallPWA = () => {
    // PWA installation logic will be implemented
    alert('PWA installation feature coming soon!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
    { id: 'privacy', label: 'Privacy & Security', icon: FiShield },
    { id: 'app', label: 'App Settings', icon: FiMonitor },
    { id: 'pwa', label: 'PWA Settings', icon: FiDownload },
    { id: 'help', label: 'Help & Support', icon: FiHelpCircle }
  ];

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleProfileUpdate}
          disabled={isUpdating}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
      <div className="space-y-4">
        {Object.entries(notificationSettings).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500">
                Receive notifications about {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setNotificationSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Security</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profile Visibility
          </label>
          <select
            value={privacySettings.profileVisibility}
            onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
        </div>
        
        {Object.entries(privacySettings).filter(([key]) => key !== 'profileVisibility').map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </h4>
              <p className="text-sm text-gray-500">
                Allow others to see your {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setPrivacySettings(prev => ({ ...prev, [key]: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAppTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">App Preferences</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={appSettings.theme}
            onChange={(e) => setAppSettings(prev => ({ ...prev, theme: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={appSettings.language}
            onChange={(e) => setAppSettings(prev => ({ ...prev, language: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Video Quality
          </label>
          <select
            value={appSettings.quality}
            onChange={(e) => setAppSettings(prev => ({ ...prev, quality: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtitles
          </label>
          <select
            value={appSettings.subtitles}
            onChange={(e) => setAppSettings(prev => ({ ...prev, subtitles: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="off">Off</option>
            <option value="on">On</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">Auto-play Videos</h4>
          <p className="text-sm text-gray-500">Automatically play videos when scrolling</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={appSettings.autoPlay}
            onChange={(e) => setAppSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );

  const renderPWATab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Progressive Web App</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FiDownload className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h4 className="font-medium text-blue-900">Install Amplifi App</h4>
            <p className="text-sm text-blue-700 mt-1">
              Install Amplifi as a native app on your device for the best experience.
            </p>
            <button
              onClick={handleInstallPWA}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Install App
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Offline Mode</h4>
            <p className="text-sm text-gray-500">Access content when offline</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-500">Receive notifications even when app is closed</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">App Updates</h4>
            <p className="text-sm text-gray-500">Automatic updates in the background</p>
          </div>
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Available</span>
        </div>
      </div>
    </div>
  );

  const renderHelpTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Help & Support</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Getting Started</h4>
          <p className="text-sm text-gray-600 mb-3">
            Learn the basics of using Amplifi and discover all the features.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Guide →
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Creator Resources</h4>
          <p className="text-sm text-gray-600 mb-3">
            Tips and tools to help you grow your audience and monetize content.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Learn More →
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Contact Support</h4>
          <p className="text-sm text-gray-600 mb-3">
            Need help? Our support team is here to assist you.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Contact Us →
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">FAQ</h4>
          <p className="text-sm text-gray-600 mb-3">
            Find answers to commonly asked questions.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Browse FAQ →
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'app':
        return renderAppTab();
      case 'pwa':
        return renderPWATab();
      case 'help':
        return renderHelpTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
