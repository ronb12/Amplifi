import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX } from "react-icons/fi";
import { useVideo } from "../contexts/VideoContext";
import VideoCard from "../components/VideoCard";
import AdvancedSearch, { SearchFilters } from "../components/AdvancedSearch";

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { searchVideos } = useVideo();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    uploadDate: 'any',
    duration: 'any',
    quality: 'any',
    type: 'video',
    features: []
  });

  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (query) {
      setLoading(true);
      // Simulate search delay
      setTimeout(() => {
        const results = searchVideos(query);
        setSearchResults(results);
        setLoading(false);
      }, 500);
    }
  }, [query, searchVideos]);

  if (!query) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Search Content</h1>
        <p className="text-gray-600">Enter a search term to find content</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Searching...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Search results for "{query}"
        </h1>
        <button
          onClick={() => setShowAdvancedSearch(true)}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiFilter className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-medium text-gray-700">Active filters:</span>
            <button
              onClick={() => {
                setActiveFilters([]);
                setSearchFilters({
                  sortBy: 'relevance',
                  uploadDate: 'any',
                  duration: 'any',
                  quality: 'any',
                  type: 'video',
                  features: []
                });
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span>{filter}</span>
                <button
                  onClick={() => setActiveFilters(prev => prev.filter((_, i) => i !== index))}
                  className="hover:text-blue-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
      
      {searchResults.length === 0 ? (
        <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No content found for "{query}"</p>
            <p className="text-gray-500">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.map((video) => (
            <VideoCard key={video.id} video={video} horizontal />
          ))}
        </div>
      )}

      <AdvancedSearch
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onApplyFilters={(filters) => {
          setSearchFilters(filters);
          const newFilters: string[] = [];
          
          if (filters.sortBy !== 'relevance') {
            newFilters.push(`Sort: ${filters.sortBy.replace('_', ' ')}`);
          }
          if (filters.uploadDate !== 'any') {
            newFilters.push(`Upload: ${filters.uploadDate}`);
          }
          if (filters.duration !== 'any') {
            newFilters.push(`Duration: ${filters.duration}`);
          }
          if (filters.quality !== 'any') {
            newFilters.push(`Quality: ${filters.quality.toUpperCase()}`);
          }
          if (filters.type !== 'video') {
            newFilters.push(`Type: ${filters.type}`);
          }
          if (filters.features.length > 0) {
            newFilters.push(`Features: ${filters.features.join(', ')}`);
          }
          
          setActiveFilters(newFilters);
        }}
        currentFilters={searchFilters}
      />
    </div>
  );
};

export default SearchPage;
