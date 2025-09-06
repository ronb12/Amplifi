import React, { useState } from 'react';
import { FiClock, FiPlay, FiEdit3, FiPlus, FiX } from 'react-icons/fi';

export interface VideoChapter {
  id: string;
  title: string;
  timestamp: number; // seconds
  duration: number; // seconds
  description?: string;
}

interface VideoChaptersProps {
  chapters: VideoChapter[];
  currentTime: number;
  onChapterClick: (timestamp: number) => void;
  onChapterEdit?: (chapter: VideoChapter) => void;
  onChapterDelete?: (chapterId: string) => void;
  onChapterAdd?: (chapter: Omit<VideoChapter, 'id'>) => void;
  isEditable?: boolean;
}

const VideoChapters: React.FC<VideoChaptersProps> = ({
  chapters,
  currentTime,
  onChapterClick,
  onChapterEdit,
  onChapterDelete,
  onChapterAdd,
  isEditable = false
}) => {
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({
    title: '',
    timestamp: 0,
    duration: 0,
    description: ''
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentChapter = () => {
    return chapters.find(chapter => 
      currentTime >= chapter.timestamp && 
      currentTime < chapter.timestamp + chapter.duration
    );
  };

  const handleAddChapter = () => {
    if (newChapter.title.trim() && newChapter.timestamp >= 0) {
      onChapterAdd?.({
        title: newChapter.title.trim(),
        timestamp: newChapter.timestamp,
        duration: newChapter.duration || 30,
        description: newChapter.description.trim() || undefined
      });
      
      setNewChapter({ title: '', timestamp: 0, duration: 0, description: '' });
      setIsAddingChapter(false);
    }
  };

  const handleEditChapter = (chapter: VideoChapter) => {
    if (onChapterEdit) {
      onChapterEdit(chapter);
    }
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (onChapterDelete) {
      onChapterDelete(chapterId);
    }
  };

  const sortedChapters = [...chapters].sort((a, b) => a.timestamp - b.timestamp);
  const currentChapter = getCurrentChapter();

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <FiClock className="w-5 h-5 text-blue-600" />
          <span>Chapters</span>
        </h3>
        
        {isEditable && (
          <button
            onClick={() => setIsAddingChapter(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        )}
      </div>

      {/* Current Chapter Indicator */}
      {currentChapter && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiPlay className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Currently playing: {currentChapter.title}
            </span>
          </div>
        </div>
      )}

      {/* Add Chapter Form */}
      {isAddingChapter && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Chapter</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Chapter title"
              value={newChapter.title}
              onChange={(e) => setNewChapter(prev => ({ ...prev, title: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Timestamp (seconds)"
              value={newChapter.timestamp}
              onChange={(e) => setNewChapter(prev => ({ ...prev, timestamp: parseInt(e.target.value) || 0 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Duration (seconds)"
              value={newChapter.duration}
              onChange={(e) => setNewChapter(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <textarea
            placeholder="Chapter description (optional)"
            value={newChapter.description}
            onChange={(e) => setNewChapter(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleAddChapter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              Add Chapter
            </button>
            <button
              onClick={() => {
                setIsAddingChapter(false);
                setNewChapter({ title: '', timestamp: 0, duration: 0, description: '' });
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chapters List */}
      <div className="space-y-2">
        {sortedChapters.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No chapters available</p>
        ) : (
          sortedChapters.map((chapter, index) => {
            const isActive = currentChapter?.id === chapter.id;
            const isPast = currentTime >= chapter.timestamp;
            
            return (
              <div
                key={chapter.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 border-blue-200' 
                    : isPast 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => onChapterClick(chapter.timestamp)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      isActive ? 'text-blue-800' : 'text-gray-900'
                    }`}>
                      {chapter.title}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatTime(chapter.timestamp)} • {formatTime(chapter.duration)}
                    </p>
                    {chapter.description && (
                      <p className="text-xs text-gray-400 mt-1">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>

                {isEditable && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditChapter(chapter);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit chapter"
                    >
                      <FiEdit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(chapter.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete chapter"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Chapter Progress Bar */}
      {sortedChapters.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Chapter Progress</span>
            <span>{formatTime(currentTime)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            {sortedChapters.map((chapter, index) => {
              const chapterStart = chapter.timestamp;
              const chapterEnd = chapter.timestamp + chapter.duration;
              const totalDuration = Math.max(...sortedChapters.map(c => c.timestamp + c.duration));
              
              const left = (chapterStart / totalDuration) * 100;
              const width = (chapter.duration / totalDuration) * 100;
              const isActive = currentChapter?.id === chapter.id;
              
              return (
                <div
                  key={chapter.id}
                  className={`absolute h-2 rounded-full ${
                    isActive ? 'bg-blue-600' : 'bg-gray-400'
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoChapters;
