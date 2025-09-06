import React from 'react';

const StoriesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">📖 Stories</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📖</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stories</h2>
          <p className="text-gray-600">Share your daily moments and experiences.</p>
        </div>
      </div>
    </div>
  );
};

export default StoriesPage;
