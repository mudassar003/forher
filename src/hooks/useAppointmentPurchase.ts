// src/hooks/useAppointmentPurchase.ts
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { 
  AppointmentPurchaseOptions, 
  AppointmentPurchaseParams, 
  AppointmentPurchaseResult 
} from '@/types/appointment';
import { validateSubscriptionId } from '@/utils/subscriptionUtils';

export function useAppointmentPurchase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { subscriptions, hasActiveSubscription } = useSubscriptionStore();

  // Function to purchase an appointment
  const purchaseAppointment = async (
    appointmentId: string,
    options: AppointmentPurchaseOptions = {}
  ): Promise<AppointmentPurchaseResult> => {
    // Check if user is authenticated
    if (!user) {
      const errorMessage = "You must be logged in to book an appointment";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare request parameters
      const params: AppointmentPurchaseParams = {
        appointmentId,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.user_metadata?.full_name || user.user_metadata?.name,
      };

      // Add subscription ID if using subscription
      if (options.useSubscription) {
        // If a specific subscription ID was provided
        if (options.subscriptionId) {
          params.subscriptionId = options.subscriptionId;
        } else if (hasActiveSubscription) {
          // Find the first active subscription
          const activeSubscriptionId = validateSubscriptionId(undefined, subscriptions);
          if (activeSubscriptionId) {
            params.subscriptionId = activeSubscriptionId;
          } else {
            const errorMessage = "Required subscription not found. Please refresh the page and try again.";
            setError(errorMessage);
            setIsLoading(false);
            return { success: false, error: errorMessage };
          }
        } else {
          const errorMessage = "Active subscription required but not found.";
          setError(errorMessage);
          setIsLoading(false);
          return { success: false, error: errorMessage };
        }
      }
      
      // Make API request to create appointment purchase
      const response = await fetch('/api/stripe/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        console.error("Appointment purchase error:", result);
        throw new Error(result.error || 'Failed to create appointment');
      }
      
      // Return the Stripe checkout URL
      return {
        success: true,
        appointmentId: result.appointmentId,
        sessionId: result.sessionId,
        url: result.url
      };
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during appointment booking';
      console.error('Appointment purchase error:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    purchaseAppointment
  };
}