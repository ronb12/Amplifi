import React, { useState } from 'react';
import { FiFilter, FiX, FiCalendar, FiClock, FiEye, FiTrendingUp } from 'react-icons/fi';

export interface SearchFilters {
  sortBy: 'relevance' | 'upload_date' | 'view_count' | 'rating';
  uploadDate: 'hour' | 'today' | 'week' | 'month' | 'year' | 'any';
  duration: 'short' | 'medium' | 'long' | 'any';
  quality: 'hd' | '4k' | 'any';
  type: 'video' | 'channel' | 'playlist';
  features: string[];
}

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: SearchFilters) => void;
  currentFilters: SearchFilters;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ 
  isOpen, 
  onClose, 
  onApplyFilters, 
  currentFilters 
}) => {
  const [filters, setFilters] = useState<SearchFilters>(currentFilters);

  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: FiTrendingUp },
    { value: 'upload_date', label: 'Upload date', icon: FiCalendar },
    { value: 'view_count', label: 'View count', icon: FiEye },
    { value: 'rating', label: 'Rating', icon: FiTrendingUp }
  ];

  const uploadDateOptions = [
    { value: 'hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' }
  ];

  const durationOptions = [
    { value: 'short', label: 'Under 4 minutes' },
    { value: 'medium', label: '4-20 minutes' },
    { value: 'long', label: 'Over 20 minutes' }
  ];

  const qualityOptions = [
    { value: 'any', label: 'Any quality' },
    { value: 'hd', label: 'HD' },
    { value: '4k', label: '4K' }
  ];

  const typeOptions = [
    { value: 'video', label: 'Videos' },
    { value: 'channel', label: 'Channels' },
    { value: 'playlist', label: 'Playlists' }
  ];

  const featureOptions = [
    'Live',
    '4K',
    'HD',
    'Subtitles/CC',
    'Creative Commons',
    '360°',
    'VR180',
    '3D',
    'HDR',
    'Location',
    'Purchased'
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFilters(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: SearchFilters = {
      sortBy: 'relevance',
      uploadDate: 'any',
      duration: 'any',
      quality: 'any',
      type: 'video',
      features: []
    };
    setFilters(defaultFilters);
    onApplyFilters(defaultFilters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Search Filters</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sort by</h3>
            <div className="grid grid-cols-2 gap-2">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sortBy"
                      value={option.value}
                      checked={filters.sortBy === option.value}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="text-blue-600"
                    />
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Upload Date */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Upload date</h3>
            <div className="grid grid-cols-2 gap-2">
              {uploadDateOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="uploadDate"
                    value={option.value}
                    checked={filters.uploadDate === option.value}
                    onChange={(e) => handleFilterChange('uploadDate', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Duration</h3>
            <div className="grid grid-cols-3 gap-2">
              {durationOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duration"
                    value={option.value}
                    checked={filters.duration === option.value}
                    onChange={(e) => handleFilterChange('duration', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quality</h3>
            <div className="grid grid-cols-3 gap-2">
              {qualityOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="quality"
                    value={option.value}
                    checked={filters.quality === option.value}
                    onChange={(e) => handleFilterChange('quality', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={option.value}
                    checked={filters.type === option.value}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="text-blue-600"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Features</h3>
            <div className="grid grid-cols-2 gap-2">
              {featureOptions.map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.features.includes(feature)}
                    onChange={() => handleFeatureToggle(feature)}
                    className="text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Reset filters
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch;
