// src/app/account/appointments/components/RefreshAppointmentsButton.tsx
"use client";

import { useState } from 'react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { useAuthStore } from '@/store/authStore';

interface RefreshAppointmentsButtonProps {
  className?: string;
}

export const RefreshAppointmentsButton = ({ className = '' }: RefreshAppointmentsButtonProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean | null>(null);
  const { refreshUserAppointments, refreshingAppointments } = useSubscriptionStore();
  const { user } = useAuthStore();

  const handleRefresh = async () => {
    if (!user?.id || isRefreshing || refreshingAppointments) return;
    
    setIsRefreshing(true);
    setRefreshMessage("Synchronizing appointment statuses...");
    setRefreshSuccess(null);
    
    try {
      // Call the appointment refresh function that syncs with Qualiphy and Stripe
      await refreshUserAppointments(user.id);
      
      setRefreshMessage("Appointment statuses synchronized successfully!");
      setRefreshSuccess(true);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setRefreshMessage(null);
        setRefreshSuccess(null);
      }, 5000);
    } catch (error) {
      console.error("Error refreshing appointments:", error);
      setRefreshMessage("An error occurred during synchronization. Please try again.");
      setRefreshSuccess(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={className}>
      {refreshMessage && (
        <div className={`p-3 rounded-md mb-3 ${
          refreshSuccess === true 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : refreshSuccess === false 
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          {refreshMessage}
        </div>
      )}
      
      <button
        onClick={handleRefresh}
        disabled={isRefreshing || refreshingAppointments}
        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {(isRefreshing || refreshingAppointments) ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refreshing...
          </>
        ) : (
          <>
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Status
          </>
        )}
      </button>
    </div>
  );
};

export default RefreshAppointmentsButton;