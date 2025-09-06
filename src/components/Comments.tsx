import React, { useState } from 'react';
import { FiHeart, FiMessageCircle, FiMoreVertical, FiFlag } from 'react-icons/fi';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: number;
  isLiked: boolean;
}

interface CommentsProps {
  videoId: string;
}

const Comments: React.FC<CommentsProps> = ({ videoId }) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'John Doe',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40',
      content: 'Great content! Really helped me understand the concepts better.',
      timestamp: '2 hours ago',
      likes: 24,
      replies: 3,
      isLiked: false
    },
    {
      id: '2',
      author: 'Sarah Wilson',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40',
      content: 'Can you make more videos about this topic? It\'s really interesting!',
      timestamp: '5 hours ago',
      likes: 18,
      replies: 1,
      isLiked: true
    },
    {
      id: '3',
      author: 'Mike Johnson',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40',
      content: 'I\'ve been looking for this explanation everywhere. Thank you!',
      timestamp: '1 day ago',
      likes: 42,
      replies: 0,
      isLiked: false
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleLike = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
        : comment
    ));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40',
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      replies: 0,
      isLiked: false
    };

    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const handleSubmitReply = (commentId: string) => {
    if (!replyText.trim()) return;

    // In a real app, you'd add the reply to the comment
    setReplyingTo(null);
    setReplyText('');
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="flex space-x-3">
        <img 
          src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40"
          alt="Your avatar"
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-full transition-colors"
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <img 
              src={comment.authorAvatar}
              alt={comment.author}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-medium text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-gray-800 mb-3">{comment.content}</p>
                
                <div className="flex items-center space-x-4 text-sm">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center space-x-1 ${
                      comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(comment.likes)}</span>
                  </button>
                  
                  <button
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                  
                  <button className="text-gray-500 hover:text-gray-700">
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Reply Input */}
              {replyingTo === comment.id && (
                <div className="mt-3 ml-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              )}

              {/* Replies Count */}
              {comment.replies > 0 && (
                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700">
                  View {comment.replies} {comment.replies === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
