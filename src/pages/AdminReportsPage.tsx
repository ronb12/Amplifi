import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiFlag, FiTrash2 } from 'react-icons/fi';
import { loadState, saveState, storageKeys } from '../services/storage';

interface ModerationReport {
  id: string;
  type: string;
  contentId: string;
  reason: string;
  createdAt: string;
}

const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ModerationReport[]>(() => loadState(storageKeys.reports, []));
  const [filter, setFilter] = useState('all');

  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter(report => report.type === filter);
  }, [filter, reports]);

  const updateReports = (nextReports: ModerationReport[]) => {
    setReports(nextReports);
    saveState(storageKeys.reports, nextReports);
  };

  const resolveReport = (reportId: string) => {
    updateReports(reports.filter(report => report.id !== reportId));
    toast.success('Report resolved');
  };

  const removeContent = (reportId: string) => {
    updateReports(reports.filter(report => report.id !== reportId));
    toast.success('Content queued for removal');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Reports</h1>
          <p className="text-sm text-gray-600">Review community reports across videos and comments.</p>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All reports</option>
          <option value="video">Videos</option>
          <option value="comment">Comments</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <FiFlag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-gray-900">No reports to review</h2>
            <p className="text-gray-600">New video and comment reports will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map(report => (
              <div key={report.id} className="p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full capitalize">
                      {report.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-900 mt-2">Reported content: {report.contentId}</h2>
                  <p className="text-sm text-gray-600">Reason: {report.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">Report ID: {report.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => resolveReport(report.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Resolve
                  </button>
                  <button
                    onClick={() => removeContent(report.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Remove Content
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
