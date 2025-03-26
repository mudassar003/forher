//src/services/subscriptionService.ts
import { supabase } from '@/lib/supabase';

/**
 * Cancel a subscription
 * @param subscriptionId The Stripe subscription ID to cancel
 * @returns Promise with success status and message
 */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // First, fetch the user subscription to get the Stripe subscription ID
    const { data: userSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !userSubscription?.stripe_subscription_id) {
      throw new Error(fetchError?.message || 'Subscription not found');
    }

    // Call our API to cancel the subscription with Stripe
    const response = await fetch('/api/stripe/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: userSubscription.stripe_subscription_id,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to cancel subscription');
    }

    return {
      success: true,
      message: result.message || 'Subscription cancelled successfully'
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}