// src/components/QualiphyWidgetAuthWrapper.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import Link from 'next/link';

interface QualiphyWidgetAuthWrapperProps {
  children: React.ReactNode;
}

export const QualiphyWidgetAuthWrapper: React.FC<QualiphyWidgetAuthWrapperProps> = ({ children }) => {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuthStore();
  const { 
    hasActiveSubscription,
    subscriptions,
    loading: subscriptionLoading,
    syncSubscriptionStatuses,
    fetchUserSubscriptions
  } = useSubscriptionStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [forceChecked, setForceChecked] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // Store the current path for redirection after login
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      // If we haven't already performed a force check and we have a user
      if (!forceChecked && user?.id) {
        setForceChecked(true);
        
        try {
          // Force fetch latest subscription data
          await fetchUserSubscriptions(user.id);
          
          // If we still don't have active subscription, try syncing with Stripe
          if (!hasActiveSubscription) {
            setSuccessMessage("Checking subscription status...");
            await syncSubscriptionStatuses(user.id);
            
            // Fetch again after sync
            await fetchUserSubscriptions(user.id);
          }
        } catch (err) {
          console.error("Error checking subscription:", err);
          // Continue anyway
        }
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [
    authLoading, 
    subscriptionLoading, 
    isAuthenticated, 
    user,
    router,
    hasActiveSubscription,
    syncSubscriptionStatuses,
    fetchUserSubscriptions,
    forceChecked
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="bg-red-50 p-6 rounded-lg max-w-md">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-red-800 mb-3">Access Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex justify-center">
            <Link href="/account" className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Return to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Debug subscription status
  console.log("Subscription status:", { 
    hasActiveSubscription, 
    subscriptions: subscriptions.map(s => ({ 
      id: s.id, 
      status: s.status, 
      is_active: s.is_active 
    }))
  });

  // Check if we actually have an active subscription manually
  // This is a failsafe in case hasActiveSubscription isn't working correctly
  const manualActiveCheck = subscriptions.some(sub => 
    ['active', 'trialing', 'cancelling', 'past_due'].includes(sub.status.toLowerCase()) && 
    sub.is_active === true
  );

  // No valid subscription access (use manual check as backup)
  if (!hasActiveSubscription && !manualActiveCheck) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg max-w-md">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-medium text-yellow-800 mb-3">Subscription Required</h2>
          <p className="text-yellow-700 mb-4">
            You need an active subscription to access telehealth consultations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/subscriptions" className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600">
              View Subscriptions
            </Link>
            <button 
              onClick={() => {
                if (user?.id) {
                  setSuccessMessage("Checking subscription status...");
                  syncSubscriptionStatuses(user.id)
                    .then(() => fetchUserSubscriptions(user.id))
                    .then(() => setSuccessMessage("Subscription status updated"))
                    .catch(() => setSuccessMessage("Failed to update subscription status"))
                    .finally(() => {
                      setTimeout(() => setSuccessMessage(null), 3000);
                    });
                }
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Refresh Subscription Status
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If everything is good, render the children with success message if present
  return (
    <>
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default QualiphyWidgetAuthWrapper;