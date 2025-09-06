import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiPlay, FiImage, FiEdit3, FiGlobe, FiLock } from 'react-icons/fi';

interface VideoUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadData {
  title: string;
  description: string;
  tags: string[];
  visibility: 'public' | 'unlisted' | 'private';
  thumbnail: File | null;
  video: File | null;
  category: string;
  language: string;
  ageRestriction: boolean;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ isOpen, onClose }) => {
  const [uploadData, setUploadData] = useState<UploadData>({
    title: '',
    description: '',
    tags: [],
    visibility: 'public',
    thumbnail: null,
    video: null,
    category: 'education',
    language: 'en',
    ageRestriction: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tagInput, setTagInput] = useState('');

  const videoRef = useRef<HTMLInputElement>(null);
  const thumbnailRef = useRef<HTMLInputElement>(null);

  const categories = [
    { value: 'education', label: 'Education' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'music', label: 'Music' },
    { value: 'news', label: 'News & Politics' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Science & Technology' },
    { value: 'travel', label: 'Travel' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'howto', label: 'How-to & Style' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'zh', label: 'Chinese' }
  ];

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadData(prev => ({ ...prev, video: file }));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadData(prev => ({ ...prev, thumbnail: file }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && uploadData.tags.length < 15) {
      setUploadData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setUploadData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleUpload = async () => {
    if (!uploadData.video) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          onClose();
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Upload Video</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-16 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Video Upload */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Video</h3>
              <p className="text-gray-500 mb-4">
                Drag and drop video files to upload or click to browse
              </p>
              <input
                ref={videoRef}
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
                className="hidden"
              />
              <button
                onClick={() => videoRef.current?.click()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Select Files
              </button>
              {uploadData.video && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiPlay className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{uploadData.video.name}</p>
                      <p className="text-sm text-gray-500">
                        {(uploadData.video.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm text-gray-500">
              <p>• Maximum file size: 128 GB</p>
              <p>• Supported formats: MP4, MOV, AVI, WMV, FLV</p>
              <p>• Processing time depends on file size</p>
            </div>
          </div>
        )}

        {/* Step 2: Video Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={uploadData.title}
                onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add a title that describes your video"
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploadData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={uploadData.description}
                onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                maxLength={5000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell viewers about your video"
              />
              <p className="text-xs text-gray-500 mt-1">
                {uploadData.description.length}/5000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add tags to help people find your video"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {uploadData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(index)}
                      className="hover:text-blue-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadData.tags.length}/15 tags
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={uploadData.language}
                  onChange={(e) => setUploadData(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 mb-2">Upload a custom thumbnail</p>
                <input
                  ref={thumbnailRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailSelect}
                  className="hidden"
                />
                <button
                  onClick={() => thumbnailRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Choose Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Visibility & Settings */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Visibility
              </label>
              <div className="space-y-3">
                {[
                  { value: 'public', icon: FiGlobe, label: 'Public', desc: 'Everyone can search for and view' },
                  { value: 'unlisted', icon: FiEdit3, label: 'Unlisted', desc: 'Anyone with the link can view' },
                  { value: 'private', icon: FiLock, label: 'Private', desc: 'Only you can view' }
                ].map((option) => (
                  <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={uploadData.visibility === option.value}
                      onChange={(e) => setUploadData(prev => ({ ...prev, visibility: e.target.value as any }))}
                      className="mt-1"
                    />
                    <div className="flex items-center space-x-2">
                      <option.icon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadData.ageRestriction}
                  onChange={(e) => setUploadData(prev => ({ ...prev, ageRestriction: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">
                  Age-restrict this video (for viewers 18 and older)
                </span>
              </label>
            </div>

            {isUploading && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800 font-medium">Uploading...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-700 mt-1">{uploadProgress}% complete</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && !uploadData.video}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleUpload}
                disabled={!uploadData.video || isUploading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUpload;
