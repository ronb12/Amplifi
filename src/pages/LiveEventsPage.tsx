import React, { useState } from 'react';
import { useLiveEvent } from '../contexts/LiveEventContext';
import { useAuth } from '../contexts/AuthContext';
import { FiCalendar, FiClock, FiUsers, FiDollarSign, FiPlay, FiTag, FiStar } from 'react-icons/fi';

const LiveEventsPage: React.FC = () => {
  const { events, purchaseTicket } = useLiveEvent();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'popularity'>('date');

  const categories = [
    { id: 'all', name: 'All Events', icon: FiStar },
    { id: 'workshop', name: 'Workshops', icon: FiPlay },
    { id: 'gaming', name: 'Gaming', icon: FiPlay },
    { id: 'education', name: 'Education', icon: FiPlay },
    { id: 'business', name: 'Business', icon: FiPlay },
    { id: 'entertainment', name: 'Entertainment', icon: FiPlay }
  ];

  const filteredEvents = events
    .filter(event => selectedCategory === 'all' || event.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
        case 'price':
          return a.price - b.price;
        case 'popularity':
          return b.currentAttendees - a.currentAttendees;
        default:
          return 0;
      }
    });

  const handlePurchaseTicket = async (eventId: string) => {
    if (!user) {
      alert('Please log in to purchase tickets');
      return;
    }

    const userData = {
      name: user.displayName || user.username,
      email: user.email
    };

    const ticket = await purchaseTicket(eventId, user.id, userData);
    if (ticket) {
      alert(`Ticket purchased successfully! Check your email for confirmation.`);
    } else {
      alert('Failed to purchase ticket. Event may be sold out.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.id === category);
    if (categoryData) {
      const Icon = categoryData.icon;
      return <Icon className="w-4 h-4" />;
    }
    return <FiPlay className="w-4 h-4" />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Events</h1>
        {user?.isCreator && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Create Event
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'popularity')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="date">Date</option>
            <option value="price">Price</option>
            <option value="popularity">Popularity</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later for new events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Event Thumbnail */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center space-x-1">
                    {getCategoryIcon(event.category)}
                    <span>{event.category}</span>
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  {event.isSoldOut && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                      Sold Out
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 left-2">
                  <span className="px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded-full">
                    ${event.price}
                  </span>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-3">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiCalendar className="w-4 h-4" />
                    <span>{formatDate(event.startTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiClock className="w-4 h-4" />
                    <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FiUsers className="w-4 h-4" />
                    <span>{event.currentAttendees}/{event.maxAttendees} attendees</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">What you'll get:</h4>
                  <div className="space-y-1">
                    {event.benefits.slice(0, 3).map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                        <FiStar className="w-3 h-3 text-yellow-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                    {event.benefits.length > 3 && (
                      <span className="text-xs text-gray-500">+{event.benefits.length - 3} more benefits</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handlePurchaseTicket(event.id)}
                  disabled={event.isSoldOut}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                    event.isSoldOut
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {event.isSoldOut ? 'Sold Out' : `Get Ticket - $${event.price}`}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveEventsPage;
