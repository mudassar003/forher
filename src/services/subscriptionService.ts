// src/services/subscriptionService.ts
import { supabase } from '@/lib/supabase';
import { sanitizeSubscriptionId, sanitizeUserId, createSafeErrorMessage } from '@/utils/validation';

// Broadcast Channel for cross-tab communication
const BROADCAST_CHANNEL_NAME = 'subscription_status';

/**
 * Safely create broadcast channel with feature detection
 */
function createBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    } catch (error) {
      console.warn('Failed to create BroadcastChannel:', error);
      return null;
    }
  }
  return null;
}

/**
 * Broadcast subscription status change to other tabs
 */
function broadcastSubscriptionChange(action: 'cancelled' | 'reactivated' | 'status_changed'): void {
  const channel = createBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({
        type: 'SUBSCRIPTION_STATUS_CHANGE',
        action,
        timestamp: Date.now()
      });
      channel.close(); // Clean up immediately
      console.log(`📡 Broadcasted subscription ${action} to other tabs`);
    } catch (error) {
      console.warn('Failed to broadcast subscription change:', error);
    }
  }
}

/**
 * Cancel a subscription immediately
 * @param subscriptionId The Supabase subscription ID to cancel
 * @returns Promise with success status and message
 */
export async function cancelSubscription(subscriptionId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Input validation
    subscriptionId = sanitizeSubscriptionId(subscriptionId);
    
    console.log('Starting immediate cancellation for subscription:', subscriptionId);
    
    // First, fetch the user subscription to get the Stripe subscription ID
    const { data: userSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id, status, sanity_id')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !userSubscription) {
      console.error('Subscription fetch error:', fetchError);
      throw new Error('Subscription not found');
    }

    console.log('Found subscription:', userSubscription);

    // Check if subscription is already cancelled
    if (userSubscription.status === 'cancelled') {
      return {
        success: true,
        message: 'Subscription is already cancelled'
      };
    }

    // Call our API to cancel the subscription immediately - pass the Supabase ID
    const response = await fetch('/api/stripe/subscriptions/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscriptionId, // Pass the Supabase UUID
        immediate: true // Request immediate cancellation
      }),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      let errorMessage = `Server returned ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
        console.error('API error response:', errorData);
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError);
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('Cancellation result:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to cancel subscription');
    }

    // Immediately update local state to show cancelled status
    const now = new Date().toISOString();
    const { error: localUpdateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        is_active: false,
        cancellation_date: now,
        end_date: now,
        updated_at: now
      })
      .eq('id', subscriptionId);

    if (localUpdateError) {
      console.warn('Failed to update local status:', localUpdateError);
    }

    // 🚀 Broadcast cancellation to other tabs
    broadcastSubscriptionChange('cancelled');

    return {
      success: true,
      message: result.message || 'Subscription cancelled immediately'
    };
  } catch (error) {
    console.error('Error in cancelSubscription service:', error);
    return {
      success: false,
      error: createSafeErrorMessage(error)
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
    // Input validation
    userId = sanitizeUserId(userId);
    
    // Fetch from Supabase - removed appointment-related columns
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
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch subscriptions');
    }

    return {
      success: true,
      subscriptions: data || []
    };
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return {
      success: false,
      error: createSafeErrorMessage(error)
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
    // Input validation
    subscriptionId = sanitizeSubscriptionId(subscriptionId);
    
    // Note: Admin verification should be done by the API route calling this function
    
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
      throw new Error('Failed to update subscription status');
    }

    // 🚀 Broadcast status change to other tabs
    broadcastSubscriptionChange('status_changed');

    return {
      success: true,
      message: 'Subscription status updated successfully'
    };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return {
      success: false,
      error: createSafeErrorMessage(error)
    };
  }
}