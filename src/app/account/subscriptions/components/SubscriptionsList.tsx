//src/app/account/subscriptions/components/SubscriptionsList.tsx
"use client";
import Link from "next/link";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import SubscriptionCard from "./SubscriptionCard";
import EmptyState from "./EmptyState";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import { useState } from "react";

export const SubscriptionsList = () => {
  const { 
    subscriptions, 
    loading, 
    error, 
    cancellingId,
    cancelUserSubscription,
    fetchUserSubscriptions 
  } = useSubscriptionStore();
  
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const handleCancelSubscription = async (subscriptionId: string) => {
    // Clear any existing messages
    setSuccessMessage(null);
    setErrorMessage(null);
    
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

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        retry={() => {
          const userId = localStorage.getItem('userId');
          if (userId) {
            fetchUserSubscriptions(userId);
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

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Your Subscriptions</h2>
          <Link href="/subscriptions" className="px-4 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors">
            Browse Plans
          </Link>
        </div>

        <div className="p-6">
          {subscriptions.length === 0 ? (
            <EmptyState />
          ) : (
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