// src/hooks/useSubscriptionPurchase.ts (updated version with coupon support)
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { verifySession, refreshSession } from '@/lib/auth';

interface SubscriptionPurchaseResult {
  success: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
  metadata?: {
    subscriptionId: string;
    variantKey?: string;
    price: number;
    billingPeriod: string;
    couponApplied?: boolean;
    couponCode?: string;
    originalPrice?: number;
    discountedPrice?: number;
    discountAmount?: number;
  };
}

interface SubscriptionPurchaseRequest {
  subscriptionId: string;
  userId: string;
  userEmail: string;
  variantKey?: string;
  couponCode?: string;
}

export function useSubscriptionPurchase() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, checkSession } = useAuthStore();

  // Function to purchase a subscription plan
  const purchaseSubscription = useCallback(
    async (
      subscriptionId: string,
      variantKey?: string,
      couponCode?: string
    ): Promise<SubscriptionPurchaseResult> => {
      // Validate input parameters
      if (!subscriptionId || typeof subscriptionId !== 'string') {
        const errorMessage = "Invalid subscription ID provided";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // First, verify that the session is valid (cookie check)
      let hasValidSession = await verifySession();
      
      // If session is invalid but we think we're authenticated, try to refresh
      if (!hasValidSession && isAuthenticated) {
        // Try to refresh the session
        const refreshed = await refreshSession();
        if (refreshed) {
          hasValidSession = true;
        } else {
          // If refresh failed, update our auth state
          await checkSession();
        }
      }
      
      // Check if user is authenticated
      if (!isAuthenticated || !hasValidSession || !user) {
        const errorMessage = "You must be logged in to purchase a subscription";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Store return URL in sessionStorage to help with redirecting after auth
        sessionStorage.setItem('loginReturnUrl', '/appointment');
        
        // Prepare request payload with strict typing
        const requestData: SubscriptionPurchaseRequest = {
          subscriptionId,
          userId: user.id,
          userEmail: user.email || '',
        };
        
        // Add variant information if provided
        if (variantKey && typeof variantKey === 'string') {
          requestData.variantKey = variantKey;
        }
        
        // Add coupon code if provided
        if (couponCode && typeof couponCode === 'string') {
          requestData.couponCode = couponCode;
        }
        
        console.log('Purchasing subscription:', {
          subscriptionId,
          variantKey,
          couponCode,
          userId: user.id
        });
        
        // Make API request to create subscription purchase
        const response = await fetch('/api/stripe/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          // Include credentials to ensure cookies are sent with the request
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create subscription');
        }
        
        console.log('Subscription purchase initiated successfully:', result);
        
        // Return the Stripe checkout URL and metadata
        return {
          success: true,
          sessionId: result.sessionId,
          url: result.url,
          metadata: result.metadata
        };
      } catch (error: unknown) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'An error occurred during subscription purchase';
        
        console.error('Subscription purchase error:', error);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAuthenticated, checkSession]
  );
  
  // Function to clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    isLoading,
    error,
    purchaseSubscription,
    clearError
  };
}