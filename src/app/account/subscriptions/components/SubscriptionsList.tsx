// src/app/account/subscriptions/components/SubscriptionsList.tsx
"use client";
import Link from "next/link";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";
import SubscriptionCard from "./SubscriptionCard";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import StatusSyncButton from "./StatusSyncButton";
import { useState, useEffect } from "react";

export const SubscriptionsList: React.FC = () => {
  const { 
    subscriptions, 
    loading, 
    error, 
    cancellingId,
    isFetched,
    cancelUserSubscription,
    fetchUserSubscriptions,
    syncSubscriptionStatuses
  } = useSubscriptionStore();
  
  const { user } = useAuthStore();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Check if there are any pending subscriptions that might need syncing
  const hasPendingSubscriptions = subscriptions.some(
    subscription => subscription.status.toLowerCase() === 'pending'
  );
  
  // Effect to retry loading if needed
  useEffect(() => {
    // If we have an error and user is available, provide retry functionality
    if (error && user?.id) {
      // Auto-retry after 5 seconds
      const retryTimer = setTimeout(() => {
        fetchUserSubscriptions(user.id, true); // Force refresh
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [error, user, fetchUserSubscriptions]);
  
  const handleCancelSubscription = async (subscriptionId: string) => {
    // Clear any existing messages
    setSuccessMessage(null);
    setErrorMessage(null);
    
    if (!user?.id) {
      setErrorMessage("You must be logged in to cancel a subscription");
      return;
    }
    
    const result = await cancelUserSubscription(subscriptionId);
    
    if (result) {
      setSuccessMessage("Your subscription has been cancelled. You'll maintain access until the end of your billing period.");
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } else {
      setErrorMessage("Failed to cancel subscription. Please try again or contact support.");
    }
  };

  const handleSyncStatus = async () => {
    if (!user?.id) return;
    
    setSuccessMessage(null);
    setErrorMessage(null);
    
    try {
      const success = await syncSubscriptionStatuses(user.id);
      if (success) {
        setSuccessMessage("Subscription status updated successfully");
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage("Error syncing subscription status");
      }
    } catch (error) {
      setErrorMessage("Error syncing subscription status");
      console.error("Sync error:", error);
    }
  };

  if (loading && !isFetched) {
    return <LoadingState />;
  }

  if (error && !isFetched) {
    return (
      <ErrorState 
        error={error} 
        retry={() => {
          if (user?.id) {
            fetchUserSubscriptions(user.id, true);
          }
        }} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="inline-flex text-green-500 hover:text-green-600"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errorMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setErrorMessage(null)}
                  className="inline-flex text-red-500 hover:text-red-600"
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom StatusSyncButton component */}
      <div className="mb-4">
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
                  ? "Some of your subscriptions show a pending status. Click to synchronize with Stripe."
                  : "You can manually synchronize subscription status with Stripe to ensure your data is up-to-date."}
              </p>
              <button
                onClick={handleSyncStatus}
                disabled={loading}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                type="button"
              >
                {loading ? "Syncing..." : "Sync Subscription Status"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-black">Your Subscriptions</h2>
        </div>

        <div className="p-6">
          {loading && isFetched && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          )}
          
          {!loading && subscriptions.length === 0 && (
            <EmptyState />
          )}
          
          {!loading && subscriptions.length > 0 && (
            <div className="space-y-4">
              {subscriptions.map((subscription) => (
                <SubscriptionCard 
                  key={subscription.id} 
                  subscription={subscription} 
                  onCancel={handleCancelSubscription}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsList;