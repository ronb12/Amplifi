import React, { useState } from 'react';
import { usePlaylist } from '../contexts/PlaylistContext';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiEdit3, FiTrash2, FiPlay, FiClock, FiEye } from 'react-icons/fi';

const PlaylistsPage: React.FC = () => {
  const { playlists, createPlaylist, deletePlaylist, updatePlaylist } = usePlaylist();
  const { user } = useAuth();
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({
    title: '',
    description: '',
    isPublic: true
  });

  const handleCreatePlaylist = () => {
    if (newPlaylist.title.trim()) {
      createPlaylist({
        title: newPlaylist.title.trim(),
        description: newPlaylist.description.trim(),
        channelId: user?.channelId || '',
        channelName: user?.displayName || '',
        videoCount: 0,
        isPublic: newPlaylist.isPublic,
        thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400'
      });

      setNewPlaylist({ title: '', description: '', isPublic: true });
      setIsCreatingPlaylist(false);
    }
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Playlists</h1>
        {user?.isCreator && (
          <button
            onClick={() => setIsCreatingPlaylist(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Create Playlist</span>
          </button>
        )}
      </div>

      {/* Create Playlist Form */}
      {isCreatingPlaylist && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Playlist</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Playlist Title
              </label>
              <input
                type="text"
                value={newPlaylist.title}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter playlist title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newPlaylist.description}
                onChange={(e) => setNewPlaylist(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your playlist"
              />
            </div>
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="text-sm text-gray-700">Make playlist public</span>
              </label>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreatePlaylist}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Create Playlist
              </button>
              <button
                onClick={() => {
                  setIsCreatingPlaylist(false);
                  setNewPlaylist({ title: '', description: '', isPublic: true });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiPlay className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No playlists yet</h3>
          <p className="text-gray-500 mb-4">
            {user?.isCreator 
              ? 'Create your first playlist to organize your videos'
              : 'No playlists have been created yet'
            }
          </p>
          {user?.isCreator && (
            <button
              onClick={() => setIsCreatingPlaylist(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Playlist
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Playlist Thumbnail */}
              <div className="relative h-32 bg-gray-200">
                {playlist.videos.length > 0 ? (
                  <img
                    src={playlist.videos[0].thumbnail}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiPlay className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  {!playlist.isPublic && (
                    <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full">
                      Private
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                    {playlist.videoCount} video{playlist.videoCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Playlist Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">
                  {playlist.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {playlist.description || 'No description'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{playlist.channelName}</span>
                  <span>{formatDate(playlist.updatedAt)}</span>
                </div>

                {/* Playlist Actions */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <FiPlay className="w-4 h-4" />
                    <span>Play All</span>
                  </button>
                  
                  {user?.channelId === playlist.channelId && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => updatePlaylist(playlist.id, { title: playlist.title })}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit playlist"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlaylist(playlist.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete playlist"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
