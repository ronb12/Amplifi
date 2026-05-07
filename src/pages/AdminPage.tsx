import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiBarChart2, FiDollarSign, FiFlag, FiUsers, FiVideo } from 'react-icons/fi';
import { useLiveEvent } from '../contexts/LiveEventContext';
import { useVideo } from '../contexts/VideoContext';
import { loadState, storageKeys } from '../services/storage';

interface ModerationReport {
  id: string;
  type: string;
  contentId: string;
  reason: string;
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const { videos, channels } = useVideo();
  const { events, tickets } = useLiveEvent();
  const reports = loadState<ModerationReport[]>(storageKeys.reports, []);
  const totalViews = videos.reduce((sum, video) => sum + video.views, 0);
  const ticketRevenue = tickets.reduce((sum, ticket) => sum + ticket.price, 0);

  const stats = [
    { label: 'Videos', value: videos.length, icon: FiVideo, tone: 'text-blue-600 bg-blue-50' },
    { label: 'Channels', value: channels.length, icon: FiUsers, tone: 'text-green-600 bg-green-50' },
    { label: 'Live events', value: events.length, icon: FiBarChart2, tone: 'text-purple-600 bg-purple-50' },
    { label: 'Open reports', value: reports.length, icon: FiFlag, tone: 'text-red-600 bg-red-50' },
    { label: 'Total views', value: totalViews.toLocaleString(), icon: FiBarChart2, tone: 'text-indigo-600 bg-indigo-50' },
    { label: 'Ticket revenue', value: `$${ticketRevenue.toFixed(2)}`, icon: FiDollarSign, tone: 'text-emerald-600 bg-emerald-50' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Monitor platform health, moderation, and creator activity.</p>
        </div>
        <Link to="/admin/reports" className="btn-primary flex items-center gap-2">
          <FiFlag className="w-4 h-4" />
          Review Reports
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600 mt-4">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h2>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FiAlertTriangle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No reports are waiting for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map(report => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 capitalize">{report.type} report</p>
                    <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">Content: {report.contentId}</p>
                  <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Channels</h2>
          <div className="space-y-3">
            {[...channels]
              .sort((a, b) => b.subscribers - a.subscribers)
              .slice(0, 5)
              .map(channel => (
                <div key={channel.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={channel.avatar} alt={channel.name} className="w-9 h-9 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900">{channel.name}</p>
                      <p className="text-xs text-gray-500">{channel.videos} videos</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{channel.subscribers.toLocaleString()} subscribers</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
