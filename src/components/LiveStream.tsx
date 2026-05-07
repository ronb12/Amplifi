import React, { useState, useRef } from 'react';
import { FiVideo, FiMic, FiUsers, FiMessageCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { startProductionStream, stopPublishedStream, type PublishedStream } from '../services/liveStreaming';

interface LiveStreamProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveStream: React.FC<LiveStreamProps> = ({ isOpen, onClose }) => {
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [title, setTitle] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowChat, setAllowChat] = useState(true);
  const [streamSession, setStreamSession] = useState<PublishedStream | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [previewType, setPreviewType] = useState<'local' | 'agora'>('local');
  const videoRef = useRef<HTMLVideoElement>(null);
  const agoraPreviewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const startStream = async () => {
    if (!title.trim()) {
      alert('Add a stream title before going live.');
      return;
    }

    try {
      setStatusMessage('Starting stream...');
      const published = await startProductionStream({
        title: title.trim(),
        creatorId: user?.channelId || user?.id || 'demo-creator',
        isPublic,
        allowChat,
        previewElement: agoraPreviewRef.current || videoRef.current
      });
      setStreamSession(published);
      setPreviewType(published.tracks ? 'agora' : 'local');
      setIsLive(true);
      setViewerCount(Math.floor(Math.random() * 100) + 10);
      setStatusMessage(`Live on ${published.session.channelName}`);
    } catch (error) {
      setStatusMessage('');
      alert(error instanceof Error ? error.message : 'Failed to start stream. Please check camera and microphone permissions.');
    }
  };

  const stopStream = async () => {
    await stopPublishedStream(streamSession);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (agoraPreviewRef.current) {
      agoraPreviewRef.current.innerHTML = '';
    }
    setStreamSession(null);
    setPreviewType('local');
    setIsLive(false);
    setViewerCount(0);
    setStatusMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Live Stream</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stream Settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stream Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter stream title"
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded text-blue-600"
                  checked={isPublic}
                  onChange={(event) => setIsPublic(event.target.checked)}
                />
                <span className="text-sm text-gray-700">Public stream</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="rounded text-blue-600"
                  checked={allowChat}
                  onChange={(event) => setAllowChat(event.target.checked)}
                />
                <span className="text-sm text-gray-700">Allow live chat</span>
              </label>
            </div>

            {!isLive ? (
              <button
                onClick={startStream}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Go Live
              </button>
            ) : (
              <button
                onClick={stopStream}
                className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium"
              >
                End Stream
              </button>
            )}
          </div>

          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-lg overflow-hidden">
              <div
                ref={agoraPreviewRef}
                className={previewType === 'agora' ? 'w-full h-96' : 'hidden'}
              />
              <video
                ref={videoRef}
                autoPlay
                muted
                className={previewType === 'local' ? 'w-full h-96 object-cover' : 'hidden'}
              />
            </div>

            {isLive && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-700 font-medium">LIVE</span>
                    <span className="text-sm text-gray-600">{viewerCount} viewers</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiUsers className="w-4 h-4" />
                      <span>{viewerCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiMessageCircle className="w-4 h-4" />
                      <span>24</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {statusMessage && (
              <p className="mt-3 text-sm text-gray-600">{statusMessage}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;
