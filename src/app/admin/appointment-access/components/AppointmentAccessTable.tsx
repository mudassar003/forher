// src/app/admin/appointment-access/components/AppointmentAccessTable.tsx
"use client";

import { formatDate } from "@/utils/dateUtils";

interface UserAccessInfo {
  userId: string;
  userEmail: string;
  planName: string | null;
  subscriptionStatus: string | null;
  appointmentAccessedAt: string | null;
  appointmentAccessExpired: boolean;
  appointmentAccessDuration: number;
  timeRemaining: number | null;
  accessStatus: 'unused' | 'active' | 'expired';
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
}

interface AppointmentAccessTableProps {
  users: UserAccessInfo[];
  isLoading: boolean;
  onResetAccess: (user: UserAccessInfo) => void;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const AppointmentAccessTable: React.FC<AppointmentAccessTableProps> = ({ 
  users, 
  isLoading,
  onResetAccess,
  pagination,
  onPageChange
}) => {
  // Format time remaining as MM:SS
  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Format duration in minutes
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  // Render access status badge
  const renderAccessStatusBadge = (status: 'unused' | 'active' | 'expired') => {
    let bgColor = "bg-gray-100 text-gray-800";
    let icon = "";
    
    switch (status) {
      case "unused":
        bgColor = "bg-blue-100 text-blue-800";
        icon = "🔒";
        break;
      case "active":
        bgColor = "bg-green-100 text-green-800";
        icon = "🟢";
        break;
      case "expired":
        bgColor = "bg-red-100 text-red-800";
        icon = "❌";
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} flex items-center`}>
        <span className="mr-1">{icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Render subscription status badge
  const renderSubscriptionStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-gray-400">No subscription</span>;
    
    let bgColor = "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        break;
      case "cancelled":
      case "canceled":
        bgColor = "bg-red-100 text-red-800";
        break;
      case "paused":
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-2">No users found</p>
        <p className="text-sm text-gray-500">There are no users with appointment access records at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subscription Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Access Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Accessed At
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Remaining
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.userEmail}</div>
                  <div className="text-xs text-gray-500">{user.userId.substring(0, 8)}...</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.planName || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderSubscriptionStatusBadge(user.subscriptionStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderAccessStatusBadge(user.accessStatus)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.appointmentAccessedAt 
                      ? formatDate(user.appointmentAccessedAt, 'short') 
                      : 'Never'}
                  </div>
                  {user.appointmentAccessedAt && (
                    <div className="text-xs text-gray-500">
                      {formatDate(user.appointmentAccessedAt, 'medium')}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDuration(user.appointmentAccessDuration)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {user.accessStatus === 'active' 
                      ? formatTimeRemaining(user.timeRemaining) 
                      : '—'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onResetAccess(user)}
                    className="text-pink-600 hover:text-pink-900 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-md transition-colors"
                    disabled={!user.subscriptionStatus || user.subscriptionStatus.toLowerCase() !== 'active'}
                  >
                    Reset Access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.totalUsers)}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.totalUsers}</span> results
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.currentPage
                          ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentAccessTable;