import React, { useState } from 'react';
import { FiMessageSquare, FiImage, FiVideo, FiBarChart2, FiHeart, FiMessageCircle, FiShare2, FiMoreVertical, FiX } from 'react-icons/fi';

export interface CommunityPost {
  id: string;
  type: 'text' | 'image' | 'video' | 'poll' | 'announcement';
  title: string;
  content: string;
  media?: string[];
  poll?: PollData;
  author: {
    id: string;
    name: string;
    avatar: string;
    isCreator: boolean;
  };
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  isPinned?: boolean;
  isMembersOnly?: boolean;
}

export interface PollData {
  question: string;
  options: PollOption[];
  endDate: string;
  totalVotes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface CommunityPostsProps {
  posts: CommunityPost[];
  currentUserId?: string;
  onPostCreate?: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => void;
  onPostLike?: (postId: string) => void;
  onPostComment?: (postId: string, comment: string) => void;
  onPostShare?: (postId: string) => void;
  onPollVote?: (postId: string, optionId: string) => void;
  isCreator?: boolean;
}

const CommunityPosts: React.FC<CommunityPostsProps> = ({
  posts,
  currentUserId,
  onPostCreate,
  onPostLike,
  onPostComment,
  onPostShare,
  onPollVote,
  isCreator = false
}) => {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [newPost, setNewPost] = useState({
    type: 'text' as CommunityPost['type'],
    title: '',
    content: '',
    media: [] as string[],
    poll: undefined as PollData | undefined,
    isMembersOnly: false
  });
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollOptions, setPollOptions] = useState(['', '']);

  const handleCreatePost = () => {
    if (newPost.content.trim() || newPost.title.trim()) {
      onPostCreate?.({
        type: newPost.type,
        title: newPost.title,
        content: newPost.content,
        media: newPost.media,
        poll: newPost.poll,
        isMembersOnly: newPost.isMembersOnly,
        author: {
          id: currentUserId || '',
          name: 'Current User',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
          isCreator: isCreator
        }
      });

      setNewPost({
        type: 'text',
        title: '',
        content: '',
        media: [],
        poll: undefined,
        isMembersOnly: false
      });
      setIsCreatingPost(false);
      setShowPollForm(false);
      setPollOptions(['', '']);
    }
  };

  const handleAddPollOption = () => {
    setPollOptions([...pollOptions, '']);
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = value;
    setPollOptions(updatedOptions);
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(option => option.trim());
    if (validOptions.length >= 2) {
      setNewPost(prev => ({
        ...prev,
        poll: {
          question: newPost.title || 'Poll Question',
          options: validOptions.map((option, index) => ({
            id: `option_${index}`,
            text: option.trim(),
            votes: 0
          })),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          totalVotes: 0
        }
      }));
      setShowPollForm(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Create Post */}
      {isCreator && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <button
              onClick={() => setIsCreatingPost(true)}
              className="flex-1 text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
            >
              Share something with your community...
            </button>
          </div>

          {isCreatingPost && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'text' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newPost.type === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Text
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'image' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newPost.type === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiImage className="w-4 h-4 inline mr-1" />
                  Image
                </button>
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, type: 'video' }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newPost.type === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiVideo className="w-4 h-4 inline mr-1" />
                  Video
                </button>
                <button
                  onClick={() => {
                    setNewPost(prev => ({ ...prev, type: 'poll' }));
                    setShowPollForm(true);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    newPost.type === 'poll' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FiBarChart2 className="w-4 h-4 inline mr-1" />
                  Poll
                </button>
              </div>

              {newPost.type === 'poll' && showPollForm ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Poll question"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="space-y-2">
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex space-x-2">
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => handlePollOptionChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            onClick={() => handleRemovePollOption(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={handleAddPollOption}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + Add option
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePoll}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Poll
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Post title (optional)"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newPost.isMembersOnly}
                    onChange={(e) => setNewPost(prev => ({ ...prev, isMembersOnly: e.target.checked }))}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm text-gray-700">Members only</span>
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setIsCreatingPost(false);
                                             setNewPost({
                         type: 'text',
                         title: '',
                         content: '',
                         media: [],
                         poll: undefined,
                         isMembersOnly: false
                       });
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePost}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
            {/* Post Header */}
            <div className="flex items-start space-x-3 mb-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{post.author.name}</h3>
                  {post.author.isCreator && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Creator
                    </span>
                  )}
                  {post.isPinned && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                      📌 Pinned
                    </span>
                  )}
                  {post.isMembersOnly && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      👑 Members Only
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
              </div>
              <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                <FiMoreVertical className="w-4 h-4" />
              </button>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              {post.title && (
                <h4 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h4>
              )}
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Media */}
            {post.media && post.media.length > 0 && (
              <div className="mb-4">
                {post.type === 'image' && (
                  <div className="grid grid-cols-2 gap-2">
                    {post.media.map((url, index) => (
                      <img
                        key={index}
                        src={url}
                        alt={`Post media ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
                {post.type === 'video' && (
                  <video
                    src={post.media[0]}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}

            {/* Poll */}
            {post.poll && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-medium text-gray-900 mb-3">{post.poll.question}</h5>
                <div className="space-y-2">
                  {post.poll.options.map((option) => {
                    const percentage = post.poll!.totalVotes > 0 ? (option.votes / post.poll!.totalVotes) * 100 : 0;
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">{option.text}</span>
                          <span className="text-sm text-gray-500">{option.votes} votes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{percentage.toFixed(1)}%</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {post.poll.totalVotes} total votes • Ends {formatDate(post.poll.endDate)}
                </p>
              </div>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => onPostLike?.(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <FiHeart className="w-4 h-4" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button
                  onClick={() => onPostComment?.(post.id, '')}
                  className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.comments}</span>
                </button>
                <button
                  onClick={() => onPostShare?.(post.id)}
                  className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  <span className="text-sm">{post.shares}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityPosts;
