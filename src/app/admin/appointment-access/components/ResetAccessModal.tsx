// src/app/admin/appointment-access/components/ResetAccessModal.tsx
"use client";

import { useState } from "react";
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

interface ResetAccessModalProps {
  user: UserAccessInfo;
  onClose: () => void;
  onReset: (userId: string, newDuration?: number) => Promise<boolean>;
}

const ResetAccessModal: React.FC<ResetAccessModalProps> = ({ 
  user, 
  onClose, 
  onReset 
}) => {
  const [newDuration, setNewDuration] = useState<number>(user.appointmentAccessDuration || 600); // Default 10 minutes
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Duration options in seconds
  const durationOptions = [
    { value: 300, label: "5 minutes" },
    { value: 600, label: "10 minutes" },
    { value: 900, label: "15 minutes" },
    { value: 1200, label: "20 minutes" },
    { value: 1800, label: "30 minutes" },
    { value: 3600, label: "1 hour" },
    { value: 7200, label: "2 hours" }
  ];
  
  // Format duration for display
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds} seconds`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes`;
    return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''}`;
  };

  // Format time remaining
  const formatTimeRemaining = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return 'Expired';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleReset = async () => {
    if (newDuration < 60 || newDuration > 7200) {
      setError("Duration must be between 1 minute (60 seconds) and 2 hours (7200 seconds)");
      return;
    }

    setIsResetting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await onReset(user.userId, newDuration);
      
      if (result) {
        setSuccess("Appointment access has been reset successfully!");
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError("Failed to reset appointment access.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsResetting(false);
    }
  };

  // Render access status with color
  const renderAccessStatus = () => {
    const { accessStatus } = user;
    let color = "text-gray-600";
    let icon = "";
    
    switch (accessStatus) {
      case "unused":
        color = "text-blue-600";
        icon = "🔒";
        break;
      case "active":
        color = "text-green-600";
        icon = "🟢";
        break;
      case "expired":
        color = "text-red-600";
        icon = "❌";
        break;
    }
    
    return (
      <span className={`${color} font-medium`}>
        {icon} {accessStatus.charAt(0).toUpperCase() + accessStatus.slice(1)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            Reset Appointment Access
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
          
          {/* User Details */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">User Details:</p>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Email:</span>
                <span className="text-sm text-gray-900">{user.userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Plan:</span>
                <span className="text-sm text-gray-900">{user.planName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Subscription:</span>
                <span className="text-sm text-gray-900">{user.subscriptionStatus || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Access Status:</span>
                {renderAccessStatus()}
              </div>
              {user.appointmentAccessedAt && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Last Accessed:</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(user.appointmentAccessedAt, 'medium')}
                  </span>
                </div>
              )}
              {user.accessStatus === 'active' && user.timeRemaining !== null && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Time Remaining:</span>
                  <span className="text-sm text-gray-900 font-mono">
                    {formatTimeRemaining(user.timeRemaining)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Current Duration:</span>
                <span className="text-sm text-gray-900">
                  {formatDuration(user.appointmentAccessDuration)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Duration Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Access Duration
            </label>
            <select
              value={newDuration}
              onChange={(e) => setNewDuration(Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
            >
              {durationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              The user will have this amount of time to complete their appointment booking
            </p>
          </div>
          
          {/* Reset Warning */}
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Warning:</strong> This action will reset the user's appointment access, giving them a fresh {formatDuration(newDuration)} to access the appointment page.
                </p>
                <ul className="mt-2 text-xs text-yellow-600 list-disc list-inside">
                  <li>Previous access time will be cleared</li>
                  <li>Access expiration status will be reset</li>
                  <li>User will receive full access duration again</li>
                  <li>This cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Subscription Check */}
          {(!user.subscriptionStatus || user.subscriptionStatus.toLowerCase() !== 'active') && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Note:</strong> This user does not have an active subscription. 
                    They will not be able to access the appointment page even after reset.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            disabled={isResetting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-pink-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-pink-700 focus:outline-none disabled:opacity-50"
            disabled={isResetting || (!user.subscriptionStatus || user.subscriptionStatus.toLowerCase() !== 'active')}
          >
            {isResetting ? "Resetting..." : `Reset Access (${formatDuration(newDuration)})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetAccessModal;