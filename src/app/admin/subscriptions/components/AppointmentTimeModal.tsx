// src/app/admin/subscriptions/components/AppointmentTimeModal.tsx
"use client";

import { useState } from "react";
import { formatDate } from "@/utils/dateUtils";

interface Subscription {
  id: string;
  user_email: string;
  plan_name: string;
  status: string;
  is_active: boolean;
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number;
}

interface AppointmentTimeModalProps {
  subscription: Subscription;
  onClose: () => void;
  onUpdate: (subscriptionId: string, updates: AppointmentTimeUpdate) => Promise<boolean>;
}

interface AppointmentTimeUpdate {
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number;
}

const AppointmentTimeModal: React.FC<AppointmentTimeModalProps> = ({ 
  subscription, 
  onClose, 
  onUpdate 
}) => {
  const [accessedAt, setAccessedAt] = useState<string>(
    subscription.appointment_accessed_at 
      ? new Date(subscription.appointment_accessed_at).toISOString().slice(0, 16)
      : ''
  );
  const [isExpired, setIsExpired] = useState<boolean>(subscription.appointment_access_expired);
  const [duration, setDuration] = useState<number>(subscription.appointment_access_duration);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Calculate remaining time for display
  const calculateRemainingTime = () => {
    if (!accessedAt || isExpired) return 0;
    
    const accessTime = new Date(accessedAt);
    const now = new Date();
    const durationMs = duration * 1000;
    const elapsedMs = now.getTime() - accessTime.getTime();
    const remainingMs = durationMs - elapsedMs;
    
    return Math.max(0, Math.ceil(remainingMs / 1000));
  };
  
  const handleUpdate = async () => {
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updates: AppointmentTimeUpdate = {
        appointment_accessed_at: accessedAt ? new Date(accessedAt).toISOString().replace('Z', '') : null,
        appointment_access_expired: isExpired,
        appointment_access_duration: duration
      };
      
      const result = await onUpdate(subscription.id, updates);
      
      if (result) {
        setSuccess("Appointment access updated successfully!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("Failed to update appointment access.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetAccess = () => {
    setAccessedAt('');
    setIsExpired(false);
  };

  const handleGrantFreshAccess = () => {
    setAccessedAt(new Date().toISOString().slice(0, 16));
    setIsExpired(false);
  };

  const remainingSeconds = calculateRemainingTime();
  const remainingMinutes = Math.ceil(remainingSeconds / 60);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg my-8 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Manage Appointment Access
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="px-6 py-4 flex-shrink-0">
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
          
          {/* User Info */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Subscription Details:</p>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm"><span className="font-medium">Email:</span> {subscription.user_email}</p>
              <p className="text-sm"><span className="font-medium">Plan:</span> {subscription.plan_name}</p>
              <p className="text-sm"><span className="font-medium">Status:</span> {subscription.status}</p>
            </div>
          </div>

          {/* Current Status Display */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Current Appointment Access:</p>
            <div className="bg-blue-50 p-3 rounded-md">
              {subscription.appointment_access_expired ? (
                <p className="text-sm text-red-700">🚫 Access Expired</p>
              ) : !subscription.appointment_accessed_at ? (
                <p className="text-sm text-green-700">✅ Fresh Access Available ({subscription.appointment_access_duration / 60} minutes)</p>
              ) : (
                <div>
                  <p className="text-sm text-blue-700">⏱️ Access In Progress</p>
                  <p className="text-xs text-gray-600">
                    Started: {formatDate(subscription.appointment_accessed_at)}
                  </p>
                  {remainingSeconds > 0 ? (
                    <p className="text-xs text-green-600">Time Remaining: {remainingMinutes} minutes</p>
                  ) : (
                    <p className="text-xs text-red-600">Time Expired (should be marked as expired)</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Quick Actions:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleResetAccess}
                className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm hover:bg-green-200"
              >
                Reset to Fresh Access
              </button>
              <button
                type="button"
                onClick={handleGrantFreshAccess}
                className="px-3 py-2 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200"
              >
                Grant Access Now
              </button>
              <button
                type="button"
                onClick={() => setIsExpired(true)}
                className="px-3 py-2 bg-red-100 text-red-800 rounded-md text-sm hover:bg-red-200"
              >
                Mark as Expired
              </button>
            </div>
          </div>

          {/* Manual Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
                Access Duration (seconds)
              </label>
              <input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min="60"
                max="7200"
                step="60"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {duration / 60} minutes (Range: 1-120 minutes)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="accessed-at">
                First Access Time (leave empty for fresh access)
              </label>
              <input
                id="accessed-at"
                type="datetime-local"
                value={accessedAt}
                onChange={(e) => setAccessedAt(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Empty = user hasn't accessed yet. Set to past time to extend session.
              </p>
            </div>
            
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isExpired}
                  onChange={(e) => setIsExpired(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Access Permanently Expired</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                When checked, user will need to contact support for more access.
              </p>
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> These changes affect appointment access timing. Users get one-time access per subscription for telehealth appointments.
            </p>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 flex-shrink-0">
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
            {isUpdating ? "Updating..." : "Update Access"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTimeModal;