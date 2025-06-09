// src/hooks/useSubscriptionPurchase.ts
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
      if (!subscriptionId || typeof subscriptionId !== 'string' || subscriptionId.trim() === '') {
        const errorMessage = "Invalid subscription ID provided";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // Prevent multiple simultaneous requests
      if (isLoading) {
        const errorMessage = "Purchase already in progress. Please wait.";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      // First, verify that the session is valid (cookie check)
      let hasValidSession = await verifySession();
      
      // If session is invalid but we think we're authenticated, try to refresh
      if (!hasValidSession && isAuthenticated) {
        try {
          const refreshed = await refreshSession();
          if (refreshed) {
            hasValidSession = true;
          } else {
            await checkSession();
          }
        } catch (refreshError) {
          // Session refresh failed, user needs to login again
          hasValidSession = false;
        }
      }
      
      // Check if user is authenticated
      if (!isAuthenticated || !hasValidSession || !user || !user.email) {
        const errorMessage = "Please log in to purchase a subscription";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Store return URL in sessionStorage to help with redirecting after auth
        try {
          sessionStorage.setItem('loginReturnUrl', '/appointment');
        } catch (storageError) {
          // Session storage not available, continue without storing
        }
        
        // Prepare request payload with strict typing
        const requestData: SubscriptionPurchaseRequest = {
          subscriptionId: subscriptionId.trim(),
          userId: user.id,
          userEmail: user.email,
        };
        
        // Add variant information if provided
        if (variantKey && typeof variantKey === 'string' && variantKey.trim() !== '') {
          requestData.variantKey = variantKey.trim();
        }
        
        // Add coupon code if provided
        if (couponCode && typeof couponCode === 'string' && couponCode.trim() !== '') {
          requestData.couponCode = couponCode.trim();
        }
        
        // Make API request to create subscription purchase with retry logic
        let response: Response;
        let retryCount = 0;
        const maxRetries = 2;
        
        while (retryCount <= maxRetries) {
          try {
            response = await fetch('/api/stripe/subscriptions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestData),
              credentials: 'include'
            });
            
            // If successful response, break out of retry loop
            if (response.ok) {
              break;
            }
            
            // If 400-499 error (client error), don't retry
            if (response.status >= 400 && response.status < 500) {
              break;
            }
            
            // For server errors (500+), retry
            if (response.status >= 500 && retryCount < maxRetries) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
              continue;
            }
            
            break;
          } catch (fetchError) {
            if (retryCount < maxRetries) {
              retryCount++;
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              continue;
            }
            throw fetchError;
          }
        }
        
        if (!response!.ok) {
          let errorMessage = 'Failed to process subscription purchase';
          
          try {
            const errorData = await response!.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (parseError) {
            // If we can't parse the error response, use status-based message
            switch (response!.status) {
              case 400:
                errorMessage = 'Invalid request. Please check your subscription details.';
                break;
              case 401:
                errorMessage = 'Authentication required. Please log in again.';
                break;
              case 403:
                errorMessage = 'Access denied. Please check your permissions.';
                break;
              case 404:
                errorMessage = 'Subscription not found. Please try again.';
                break;
              case 429:
                errorMessage = 'Too many requests. Please wait a moment and try again.';
                break;
              case 500:
                errorMessage = 'Server error. Please try again in a few moments.';
                break;
              default:
                errorMessage = `Request failed with status ${response!.status}. Please try again.`;
            }
          }
          
          throw new Error(errorMessage);
        }
        
        const result = await response!.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to create subscription');
        }
        
        // Validate response contains required fields
        if (!result.url || typeof result.url !== 'string') {
          throw new Error('Invalid response from server. Please try again.');
        }
        
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
          : 'An unexpected error occurred during subscription purchase';
        
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAuthenticated, checkSession, isLoading]
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