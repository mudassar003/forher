// src/app/admin/subscriptions/components/SubscriptionTable.tsx
"use client";

import { formatDate } from "@/utils/dateUtils";

interface Subscription {
  id: string;
  user_email: string;
  plan_name: string;
  status: string;
  is_active: boolean;
  sanity_id: string | null;
  stripe_subscription_id: string | null;
  start_date: string;
  next_billing_date: string;
  billing_amount: number;
  billing_period: string;
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  isLoading: boolean;
  onEdit: (subscription: Subscription) => void;
  onEditAppointmentTime: (subscription: Subscription) => void;
}

const SubscriptionTable: React.FC<SubscriptionTableProps> = ({ 
  subscriptions, 
  isLoading,
  onEdit,
  onEditAppointmentTime
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-2">No subscriptions found</p>
        <p className="text-sm text-gray-500">There are no subscription records available at this time.</p>
      </div>
    );
  }

  // Function to render status badge
  const renderStatusBadge = (status: string, isActive: boolean) => {
    let bgColor = "bg-gray-100 text-gray-800";
    
    switch (status.toLowerCase()) {
      case "active":
        bgColor = "bg-green-100 text-green-800";
        break;
      case "paused":
        bgColor = "bg-yellow-100 text-yellow-800";
        break;
      case "cancelled":
      case "canceled":
        bgColor = "bg-red-100 text-red-800";
        break;
      case "cancelling":
        bgColor = "bg-orange-100 text-orange-800";
        break;
      case "pending":
        bgColor = "bg-blue-100 text-blue-800";
        break;
      case "past_due":
        bgColor = "bg-orange-100 text-orange-800";
        break;
      case "trialing":
        bgColor = "bg-purple-100 text-purple-800";
        break;
      default:
        bgColor = "bg-gray-100 text-gray-800";
    }
    
    // Add an indicator if status and isActive are inconsistent
    const isConsistent = (status.toLowerCase() === 'active' && isActive) || 
                        (status.toLowerCase() !== 'active' && !isActive);
    
    return (
      <div className="flex items-center space-x-1">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
          {status}
        </span>
        {!isConsistent && (
          <span className="text-xs text-red-500" title="Status and is_active flag are inconsistent">
            ⚠️
          </span>
        )}
      </div>
    );
  };

  // Function to render appointment access status
  const renderAppointmentAccessStatus = (subscription: Subscription) => {
    if (subscription.appointment_access_expired) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Expired
        </span>
      );
    }
    
    if (!subscription.appointment_accessed_at) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Available
        </span>
      );
    }
    
    // Calculate remaining time
    const accessedAt = new Date(subscription.appointment_accessed_at);
    const now = new Date();
    const durationMs = subscription.appointment_access_duration * 1000;
    const elapsedMs = now.getTime() - accessedAt.getTime();
    const remainingMs = durationMs - elapsedMs;
    
    if (remainingMs > 0) {
      const remainingMinutes = Math.ceil(remainingMs / (1000 * 60));
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {remainingMinutes}m left
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Should Expire
        </span>
      );
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Billing
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment Access
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subscription.user_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subscription.plan_name}</div>
                  <div className="text-xs text-gray-500">{subscription.billing_period}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatusBadge(subscription.status, subscription.is_active)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(subscription.start_date, 'short')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {subscription.next_billing_date 
                      ? formatDate(subscription.next_billing_date, 'short') 
                      : 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${subscription.billing_amount}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderAppointmentAccessStatus(subscription)}
                  <div className="text-xs text-gray-500 mt-1">
                    {subscription.appointment_access_duration / 60}min duration
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => onEdit(subscription)}
                      className="text-pink-600 hover:text-pink-900"
                    >
                      Edit Status
                    </button>
                    <button
                      onClick={() => onEditAppointmentTime(subscription)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Time
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionTable;