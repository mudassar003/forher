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

interface AppointmentAccessStatus {
  success: boolean;
  hasAccess: boolean;
  isFirstTime: boolean;
  timeRemaining: number;
  accessExpired: boolean;
  subscriptionId?: string;
  message?: string;
  error?: string;
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
  
  // NEW: Appointment access state - Core business protection
  const [appointmentAccess, setAppointmentAccess] = useState<AppointmentAccessStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [accessCheckLoading, setAccessCheckLoading] = useState<boolean>(false);
  
  // Enterprise-level subscription status check with proper error handling
  const checkSubscriptionStatus = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.warn('No user ID available for subscription status check');
      return false;
    }
    
    try {
      setSuccessMessage("Verifying subscription status...");
      
      // First sync with Stripe (this already calls fetchUserSubscriptions internally)
      const syncResult = await syncSubscriptionStatuses(user.id);
      
      if (!syncResult.success) {
        throw new Error(syncResult.error || 'Sync failed');
      }
      
      // Only fetch if sync didn't already update the data
      if (syncResult.syncedCount === 0) {
        const fetchResult = await fetchUserSubscriptions(user.id, true);
        if (!fetchResult.success) {
          throw new Error(fetchResult.error || 'Fetch failed');
        }
      }
      
      setStatusChecked(true);
      setSuccessMessage("Subscription status verified");
      
      const timeoutId = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      // Cleanup timeout on unmount
      return () => clearTimeout(timeoutId);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error("Error checking subscription:", error);
      setError(`Failed to verify subscription: ${errorMessage}`);
      return false;
    }
  }, [user?.id, syncSubscriptionStatuses, fetchUserSubscriptions]); // Remove user object, only use user.id

  // NEW: Core business logic - Check appointment access
  const checkAppointmentAccess = useCallback(async () => {
    if (!user?.id) return;
    
    setAccessCheckLoading(true);
    try {
      // Checking appointment access for authenticated user
      
      const response = await fetch('/api/appointment-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
        credentials: 'include'
      });
      
      const result: AppointmentAccessStatus = await response.json();
      // Appointment access result processed
      
      setAppointmentAccess(result);
      
      if (result.hasAccess && result.timeRemaining > 0) {
        setTimeRemaining(result.timeRemaining);
        if (result.message) {
          setSuccessMessage(result.message);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
      } else if (result.accessExpired) {
        setError(result.message || 'Your appointment access has expired.');
      } else if (result.error) {
        setError(result.error);
      }
      
    } catch (err) {
      console.error("❌ Error checking appointment access:", err);
      setError("Failed to verify appointment access. Please try again.");
    } finally {
      setAccessCheckLoading(false);
    }
  }, [user]);

  // Countdown timer for active sessions
  useEffect(() => {
    if (appointmentAccess?.hasAccess && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time expired - force refresh page to show expired state
            window.location.reload();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [appointmentAccess?.hasAccess, timeRemaining]);

  // Effect to check access when component mounts (existing logic enhanced)
  useEffect(() => {
    const checkAccess = async () => {
      // Checking access and subscription state
      
      if (authLoading) return;

      if (!isAuthenticated) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      if (user?.id && !statusChecked && !subscriptionLoading) {
        await fetchUserSubscriptions(user.id, true);
        setStatusChecked(true);
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
    statusChecked,
    fetchUserSubscriptions,
    hasActiveSubscription
  ]);

  // NEW: Check appointment access after subscription verification
  useEffect(() => {
    if (isAuthenticated && user?.id && hasActiveSubscription && statusChecked && !appointmentAccess) {
      checkAppointmentAccess();
    }
  }, [isAuthenticated, user, hasActiveSubscription, statusChecked, appointmentAccess, checkAppointmentAccess]);

  // Check URL for subscription success parameter (existing)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('subscription_success') === 'true';
    const sessionId = urlParams.get('session_id');
    
    if (success && sessionId && !statusChecked) {
      checkSubscriptionStatus().then(() => {
        router.replace(window.location.pathname);
      });
    }
  }, [isAuthenticated, user, router, statusChecked, checkSubscriptionStatus]);

  // Format time remaining for display
  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading || authLoading || subscriptionLoading || accessCheckLoading) {
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
          <h2 className="text-xl font-medium text-red-800 mb-3">Access Expired</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/contact" 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Contact Support
            </Link>
            <Link 
              href="/subscriptions" 
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              View Subscriptions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check for active subscription manually as backup (existing logic)
  const manualActiveCheck = subscriptions.some(sub => 
    ['active', 'trialing', 'cancelling', 'past_due'].includes(sub.status.toLowerCase()) && 
    sub.is_active === true
  );

  // Subscription check completed

  // No valid subscription access (existing logic)
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

  // NEW: Check appointment access status before showing expensive widget
  if (!appointmentAccess) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying appointment access...</p>
        </div>
      </div>
    );
  }

  // NEW: Access expired - show contact support
  if (appointmentAccess.accessExpired || !appointmentAccess.hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
        <div className="bg-orange-50 p-6 rounded-lg max-w-md">
          <svg className="w-12 h-12 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-medium text-orange-800 mb-3">Appointment Access Expired</h2>
          <p className="text-orange-700 mb-4">
            Your one-time appointment access has been used. For additional appointments, please contact our support team.
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/contact" 
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
            >
              Contact Support
            </Link>
            <Link 
              href="/subscriptions" 
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              View Subscriptions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SUCCESS: Valid subscription + appointment access - Show expensive widget with countdown
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
      
      {/* NEW: Time remaining countdown */}
      {timeRemaining > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Time remaining: {formatTimeRemaining(timeRemaining)}</span>
                {appointmentAccess.isFirstTime && (
                  <span className="block text-xs mt-1">This is your one-time appointment access. Please complete your consultation within the time limit.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {children}
    </>
  );
};

export default QualiphyWidgetAuthWrapper;