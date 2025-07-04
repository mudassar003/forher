// src/components/QualiphyWidgetAuthWrapper.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

// Simple inline types - no external dependencies needed
interface AppointmentAccessResponse {
  success: boolean;
  hasAccess: boolean;
  subscriptionId?: string;
  message?: string;
  error?: string;
}

interface QualiphyWidgetAuthWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const QualiphyWidgetAuthWrapper: React.FC<QualiphyWidgetAuthWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { 
    hasActiveSubscription, 
    fetchUserSubscriptions, 
    loading: subscriptionLoading 
  } = useSubscriptionStore();

  // Component state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusChecked, setStatusChecked] = useState<boolean>(false);
  const [appointmentAccess, setAppointmentAccess] = useState<AppointmentAccessResponse | null>(null);
  const [accessCheckLoading, setAccessCheckLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Simple inline function to check appointment access
  const checkAppointmentAccess = React.useCallback(async () => {
    if (!user?.id || accessCheckLoading) return;
    
    setAccessCheckLoading(true);
    setError(null);
    
    try {
      console.log("🔍 Checking appointment access for user:", user.id);
      
      // Simple API call - no complex utility needed
      const response = await fetch('/api/appointment-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: AppointmentAccessResponse = await response.json();
      console.log("📋 Appointment access result:", result);
      
      setAppointmentAccess(result);
      
      if (result.success && result.hasAccess) {
        setSuccessMessage('Appointment access granted! You can now proceed with your consultation.');
      } else if (result.error) {
        setError(result.error);
      }
      
    } catch (err) {
      console.error("❌ Error checking appointment access:", err);
      setError("Failed to verify appointment access. Please try again.");
    } finally {
      setAccessCheckLoading(false);
    }
  }, [user, accessCheckLoading]);

  // Effect to check access when component mounts
  useEffect(() => {
    const checkAccess = async () => {
      console.log("Checking access, auth state:", { isAuthenticated, authLoading });
      console.log("Subscription state:", { hasActiveSubscription, subscriptionLoading });
      
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

  // Check appointment access after subscription verification
  useEffect(() => {
    if (isAuthenticated && user?.id && hasActiveSubscription && statusChecked && !appointmentAccess) {
      checkAppointmentAccess();
    }
  }, [isAuthenticated, user, hasActiveSubscription, statusChecked, appointmentAccess, checkAppointmentAccess]);

  // Loading state
  if (isLoading || authLoading || subscriptionLoading || accessCheckLoading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {accessCheckLoading ? "Verifying appointment access..." : "Checking authentication..."}
          </p>
        </div>
      </div>
    );
  }

  // Authentication required
  if (!isAuthenticated || !user) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-gray-600 mb-6">Please log in to access appointments.</p>
        <Link
          href={`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Log In
        </Link>
      </div>
    );
  }

  // No active subscription
  if (!hasActiveSubscription) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Required</h3>
        <p className="text-gray-600 mb-6">
          You need an active subscription to access appointments.
        </p>
        <div className="flex flex-col gap-3">
          <Link 
            href="/subscriptions" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            View Subscription Plans
          </Link>
          <Link 
            href="/account/subscriptions" 
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Manage Subscriptions
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Error</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={checkAppointmentAccess}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
          <Link 
            href="/contact" 
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  // Access denied
  if (appointmentAccess && !appointmentAccess.hasAccess) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Not Available</h3>
        <p className="text-gray-600 mb-6">
          {appointmentAccess.message || 'Appointment access is not available at this time.'}
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
    );
  }

  // SUCCESS: Valid subscription + appointment access - Show widget
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