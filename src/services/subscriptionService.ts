// src/services/subscriptionService.ts
import { supabase } from '@/lib/supabase';

/**
 * Cancel a subscription
 * @param subscriptionId The Supabase subscription ID to cancel
 * @returns Promise with success status and message
 */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // First, fetch the user subscription to get the Stripe subscription ID
    const { data: userSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, status')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !userSubscription) {
      throw new Error(fetchError?.message || 'Subscription not found');
    }

    // Check if subscription is already cancelled or in process of cancelling
    if (userSubscription.status === 'cancelled' || userSubscription.status === 'cancelling') {
      return {
        success: true,
        message: 'Subscription is already cancelled or in the process of being cancelled'
      };
    }

    // If no Stripe subscription ID, update locally only
    if (!userSubscription.stripe_subscription_id) {
      // Update subscription status in Supabase
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (updateError) {
        throw new Error(`Failed to update subscription status: ${updateError.message}`);
      }

      return {
        success: true,
        message: 'Subscription cancelled successfully (no Stripe subscription found)'
      };
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
      message: result.message || 'Subscription cancellation initiated successfully'
    };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Reactivate a cancelled subscription that hasn't yet expired
 * @param subscriptionId The Supabase subscription ID to reactivate
 * @returns Promise with success status and message
 */
export async function reactivateSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // First, fetch the user subscription to get the Stripe subscription ID
    const { data: userSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, status')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !userSubscription) {
      throw new Error(fetchError?.message || 'Subscription not found');
    }

    // Check if subscription can be reactivated
    if (userSubscription.status !== 'cancelling') {
      return {
        success: false,
        error: 'Only subscriptions in "cancelling" status can be reactivated'
      };
    }

    // If no Stripe subscription ID, update locally only
    if (!userSubscription.stripe_subscription_id) {
      throw new Error('Cannot reactivate subscription without Stripe subscription ID');
    }

    // Call our API to reactivate the subscription with Stripe
    const response = await fetch('/api/stripe/subscriptions/reactivate', {
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
      throw new Error(result.error || 'Failed to reactivate subscription');
    }

    return {
      success: true,
      message: result.message || 'Subscription reactivated successfully'
    };
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Get user subscription details with full information
 * @param userId The user ID to get subscriptions for
 * @returns Promise with subscription details
 */
export async function getUserSubscriptions(userId: string): Promise<{ success: boolean; subscriptions?: any[]; error?: string }> {
  try {
    // Fetch from Supabase
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        user_email,
        plan_name,
        subscription_name,
        billing_amount,
        billing_period,
        start_date,
        end_date,
        next_billing_date,
        status,
        is_active,
        stripe_subscription_id,
        sanity_id,
        has_appointment_access,
        appointment_discount_percentage,
        appointments_included,
        appointments_used,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    return {
      success: true,
      subscriptions: data || []
    };
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Force update a subscription status (admin only)
 * This is a direct local update without contacting Stripe
 * @param subscriptionId The Supabase subscription ID to update
 * @param status The new status to set
 * @param isActive Whether the subscription should be active
 * @returns Promise with success status and message
 */
export async function forceUpdateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Update subscription status in Supabase
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription status: ${updateError.message}`);
    }

    return {
      success: true,
      message: 'Subscription status updated successfully'
    };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}