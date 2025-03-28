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
    loading: subscriptionLoading 
  } = useSubscriptionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading || subscriptionLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        // Store the current path for redirection after login
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      setIsLoading(false);
    };

    checkAccess();
  }, [
    authLoading, 
    subscriptionLoading, 
    isAuthenticated, 
    router
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

  // No valid subscription access
  if (!hasActiveSubscription) {
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
          </div>
        </div>
      </div>
    );
  }

  // If everything is good, render the children
  return <>{children}</>;
}

export default QualiphyWidgetAuthWrapper;