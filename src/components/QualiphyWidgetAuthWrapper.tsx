// src/components/QualiphyWidgetAuthWrapper.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
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
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  
  // Function to check subscription status with Stripe
  const checkSubscriptionStatus = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      setSuccessMessage("Verifying subscription status...");
      
      // First sync with Stripe to ensure subscription is up-to-date
      await syncSubscriptionStatuses(user.id);
      
      // Then fetch latest subscription data
      await fetchUserSubscriptions(user.id);
      
      setStatusChecked(true);
      setSuccessMessage("Subscription status verified");
      
      // Auto-hide message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return true;
    } catch (err) {
      console.error("Error checking subscription:", err);
      return false;
    }
  }, [user, syncSubscriptionStatuses, fetchUserSubscriptions]);

  // Effect to check access when component mounts
  useEffect(() => {
    const checkAccess = async () => {
      // Wait for auth to complete
      if (authLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // Store the current path for redirection after login
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      // If we have a user but haven't loaded subscriptions yet
      if (user?.id && !statusChecked && !subscriptionLoading) {
        await checkSubscriptionStatus();
      }

      // Set loading to false after all checks
      setIsLoading(false);
    };

    checkAccess();
  }, [
    authLoading, 
    subscriptionLoading, 
    isAuthenticated, 
    user,
    router,
    statusChecked,
    checkSubscriptionStatus
  ]);

  // Check URL for subscription success parameter
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    // Get URL parameters safely after component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('subscription_success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    // If coming back from successful subscription payment
    if (success && sessionId && !statusChecked) {
      // Force check status with Stripe
      checkSubscriptionStatus().then(() => {
        // Remove query params for cleaner URL
        router.replace(window.location.pathname);
      });
    }
  }, [isAuthenticated, user, router, statusChecked, checkSubscriptionStatus]);

  if (isLoading || authLoading || subscriptionLoading) {
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

  // Check for active subscription manually as backup
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
              onClick={() => checkSubscriptionStatus()}
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