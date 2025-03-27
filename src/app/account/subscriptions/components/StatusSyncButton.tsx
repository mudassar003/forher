// src/app/account/subscriptions/components/StatusSyncButton.tsx
"use client";
import { useState } from "react";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";

interface StatusSyncButtonProps {
  hasPendingSubscriptions: boolean;
}

export const StatusSyncButton: React.FC<StatusSyncButtonProps> = ({ hasPendingSubscriptions }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);
  const { syncSubscriptionStatuses } = useSubscriptionStore();
  const { user } = useAuthStore();

  const handleSync = async () => {
    if (!user?.id || isSyncing) return;
    
    setIsSyncing(true);
    setSyncMessage("Synchronizing with Stripe...");
    setSyncSuccess(null);
    
    try {
      const success = await syncSubscriptionStatuses(user.id);
      
      if (success) {
        setSyncMessage("Subscription status synchronized successfully!");
        setSyncSuccess(true);
        
        // Clear message after 5 seconds
        setTimeout(() => {
          setSyncMessage(null);
          setSyncSuccess(null);
        }, 5000);
      } else {
        setSyncMessage("Sync failed. Please try again or contact support.");
        setSyncSuccess(false);
      }
    } catch (error) {
      console.error("Error syncing:", error);
      setSyncMessage("An error occurred during synchronization.");
      setSyncSuccess(false);
    } finally {
      setIsSyncing(false);
    }
  };

  // Only show the button if there are pending subscriptions 
  // or if issues were detected that might need syncing
  if (!hasPendingSubscriptions && syncSuccess !== false) {
    return null;
  }

  return (
    <div className="mb-4">
      {syncMessage && (
        <div className={`p-3 rounded-md mb-3 ${
          syncSuccess === true 
            ? "bg-green-50 text-green-700 border border-green-200" 
            : syncSuccess === false 
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-blue-50 text-blue-700 border border-blue-200"
        }`}>
          {syncMessage}
        </div>
      )}
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm text-blue-700 mb-2">
              {hasPendingSubscriptions 
                ? "Some of your subscriptions show a pending status, but may actually be active. Click to synchronize with Stripe."
                : "If your subscription status seems incorrect, you can manually synchronize with Stripe."}
            </p>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? "Syncing..." : "Sync Subscription Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusSyncButton;