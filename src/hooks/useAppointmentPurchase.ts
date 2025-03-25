// src/hooks/useAppointmentPurchase.ts
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';

interface AppointmentPurchaseOptions {
  useSubscription?: boolean;
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
      // Determine if using a subscription
      let subscriptionId = options.subscriptionId || undefined;
      
      // If useSubscription is true but no subscriptionId provided, try to find an active one
      if (options.useSubscription && !subscriptionId) {
        const activeSubscription = subscriptions.find(sub => 
          sub.status.toLowerCase() === 'active' && sub.appointmentsIncluded > sub.appointmentsUsed
        );
        
        if (activeSubscription) {
          subscriptionId = activeSubscription.id;
        }
      }
      
      // Make API request to create appointment purchase
      const response = await fetch('/api/stripe/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: appointmentId,
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.user_metadata?.name,
          subscriptionId: subscriptionId
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