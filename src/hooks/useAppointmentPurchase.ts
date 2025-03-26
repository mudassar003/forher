// src/hooks/useAppointmentPurchase.ts
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

interface AppointmentPurchaseOptions {
  useSubscription?: boolean;
  subscriptionId?: string;
}

interface AppointmentPurchaseParams {
  appointmentId: string;
  userId: string;
  userEmail: string;
  userName?: any;
  subscriptionId?: string;
}

interface AppointmentPurchaseResult {
  success: boolean;
  appointmentId?: string;
  sessionId?: string;
  url?: string;
  error?: string;
}

export function useAppointmentPurchase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();
  const { subscriptions } = useSubscriptionStore();

  // Function to purchase an appointment
  const purchaseAppointment = async (
    params: AppointmentPurchaseParams
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
      const { appointmentId, userId, userEmail, userName, subscriptionId } = params;
      
      // Make API request to create appointment purchase
      const response = await fetch('/api/stripe/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId,
          userId,
          userEmail,
          userName: userName || user.user_metadata?.full_name || user.user_metadata?.name,
          subscriptionId
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
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