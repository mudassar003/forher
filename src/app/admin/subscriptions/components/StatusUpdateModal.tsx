// src/app/admin/subscriptions/components/StatusUpdateModal.tsx
"use client";

import { useState } from "react";
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
}

interface StatusUpdateModalProps {
  subscription: Subscription;
  onClose: () => void;
  onUpdate: (subscriptionId: string, newStatus: string, isActive: boolean) => Promise<boolean>;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ 
  subscription, 
  onClose, 
  onUpdate 
}) => {
  const [status, setStatus] = useState<string>(subscription.status);
  const [isActive, setIsActive] = useState<boolean>(subscription.is_active);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "cancelled", label: "Cancelled" },
    { value: "cancelling", label: "Cancelling" },
    { value: "pending", label: "Pending" },
    { value: "past_due", label: "Past Due" },
    { value: "trialing", label: "Trialing" },
    { value: "incomplete", label: "Incomplete" },
    { value: "expired", label: "Expired" }
  ];
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await onUpdate(subscription.id, status, isActive);
      
      if (result) {
        setSuccess("Subscription status updated successfully!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("Failed to update subscription status.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Update Subscription Status
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Subscription Details:</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm"><span className="font-medium">Email:</span> {subscription.user_email}</p>
              <p className="text-sm"><span className="font-medium">Plan:</span> {subscription.plan_name}</p>
              <p className="text-sm"><span className="font-medium">Started:</span> {formatDate(subscription.start_date)}</p>
              <p className="text-sm"><span className="font-medium">Stripe ID:</span> {subscription.stripe_subscription_id || 'None'}</p>
              <p className="text-sm"><span className="font-medium">Sanity ID:</span> {subscription.sanity_id || 'None'}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Is Active</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">
              This controls the is_active flag which should match the status (active = true, other statuses = false)
            </p>
          </div>
          
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-yellow-700">
              <strong>Warning:</strong> Changing the subscription status here will update both Supabase and Sanity, but will <strong>not</strong> update Stripe. 
              Only use this for fixing database inconsistencies.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="px-4 py-2 bg-pink-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-pink-700 focus:outline-none disabled:opacity-50"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusUpdateModal;