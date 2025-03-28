// src/utils/subscriptionUtils.ts
import { Subscription } from '@/store/subscriptionStore';

/**
 * Checks if a subscription is active and valid
 * @param subscription The subscription to check
 * @returns boolean indicating if the subscription is active
 */
export function isActiveSubscription(subscription: Subscription): boolean {
  return (
    subscription.is_active === true && 
    ['active', 'trialing', 'cancelling'].includes(subscription.status.toLowerCase())
  );
}

/**
 * Finds the first active subscription from an array of subscriptions
 * @param subscriptions Array of subscriptions to check
 * @returns The first active subscription or undefined if none found
 */
export function findActiveSubscription(subscriptions: Subscription[]): Subscription | undefined {
  return subscriptions.find(isActiveSubscription);
}

/**
 * Validates if a string is a valid UUID format
 * @param id The string to check
 * @returns boolean indicating if the string is a valid UUID
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Ensures we have a valid Supabase subscription ID
 * @param subscriptionId The ID to validate or convert
 * @param subscriptions Available subscriptions to search for matching Sanity ID
 * @returns A valid UUID subscription ID or null if none found
 */
export function validateSubscriptionId(
  subscriptionId: string | undefined,
  subscriptions: Subscription[]
): string | null {
  // If no subscription ID provided
  if (!subscriptionId) {
    // Find the first active subscription
    const activeSubscription = findActiveSubscription(subscriptions);
    return activeSubscription?.id || null;
  }
  
  // If it's already a valid UUID, use it
  if (isValidUUID(subscriptionId)) {
    // Verify it exists in our list
    const exists = subscriptions.some(sub => sub.id === subscriptionId);
    return exists ? subscriptionId : null;
  }
  
  // Might be a Sanity ID, try to find matching subscription
  const matchingSubscription = subscriptions.find(sub => sub.sanity_id === subscriptionId);
  return matchingSubscription?.id || null;
}