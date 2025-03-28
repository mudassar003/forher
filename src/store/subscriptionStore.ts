// src/store/subscriptionStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { cancelSubscription } from '@/services/subscriptionService';

// Define types for subscription data
export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  billing_amount: number;
  billing_period: string;
  next_billing_date: string;
  start_date: string;
  totalUsers?: number;
  products?: SubscriptionProduct[];
  stripe_subscription_id?: string;
  sanity_id?: string;
  is_active: boolean;
}

export interface SubscriptionProduct {
  id: string;
  name: string;
  quantity: number;
  image: string | null;
}

interface UserSubscriptionState {
  subscriptions: Subscription[];
  hasActiveSubscription: boolean;
  loading: boolean;
  error: string | null;
  cancellingId: string | null;
  syncingSubscriptions: boolean;
  lastFetchedUserId: string | null; // Track the last fetched user ID
  
  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
}

// Helper function to check if a subscription is active
const isSubscriptionActive = (subscription: Subscription): boolean => {
  const activeStatuses = ['active', 'trialing', 'past_due', 'cancelling'];
  return activeStatuses.includes(subscription.status.toLowerCase()) && subscription.is_active === true;
};

export const useSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  hasActiveSubscription: false,
  loading: false,
  error: null,
  cancellingId: null,
  syncingSubscriptions: false,
  lastFetchedUserId: null, // Initialize with null
  
  fetchUserSubscriptions: async (userId: string) => {
    // Skip if we're already loading or if the userId is the same as last fetched
    if (get().loading || userId === get().lastFetchedUserId) {
      return;
    }
    
    set({ loading: true, error: null, lastFetchedUserId: userId });
    
    try {
      // Fetch from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false) // Only fetch non-deleted subscriptions
        .order('created_at', { ascending: false }); // Get most recent first
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Transform data to our Subscription format
      const subscriptionsData: Subscription[] = (supabaseData || []).map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        plan_name: sub.plan_name || sub.subscription_name || 'Subscription',
        status: sub.status || 'Unknown',
        is_active: sub.is_active === true, // Ensure boolean type
        billing_amount: sub.billing_amount || 0,
        billing_period: sub.billing_period || 'monthly',
        next_billing_date: sub.next_billing_date || sub.end_date || new Date().toISOString(),
        start_date: sub.start_date || new Date().toISOString(),
        totalUsers: 0, // Optional metadata
        products: [], // Could be populated from another query if needed
        stripe_subscription_id: sub.stripe_subscription_id,
        sanity_id: sub.sanity_id
      }));
      
      // Check for active subscriptions using the helper function
      const hasActive = subscriptionsData.some(isSubscriptionActive);
      
      // Check for any issues that might need syncing
      const needsSync = subscriptionsData.some(sub => {
        const isPending = sub.status.toLowerCase() === 'pending';
        const hasStripeId = !!sub.stripe_subscription_id;
        const isInconsistent = (sub.status.toLowerCase() === 'active' && !sub.is_active) || 
                              (sub.status.toLowerCase() !== 'active' && sub.is_active);
        
        return (isPending && hasStripeId) || isInconsistent;
      });
      
      set({ 
        subscriptions: subscriptionsData,
        hasActiveSubscription: hasActive,
        loading: false
      });
      
      // Auto-sync if we detect issues, but don't wait for it to complete and don't trigger re-renders
      if (needsSync && !get().syncingSubscriptions) {
        // This runs in the background
        get().syncSubscriptionStatuses(userId).catch(console.error);
      }
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error fetching subscriptions',
        subscriptions: [],
        loading: false
      });
    }
  },
  
  cancelUserSubscription: async (subscriptionId: string) => {
    try {
      set({ cancellingId: subscriptionId, error: null });
      
      // Get the subscription
      const subscription = get().subscriptions.find(sub => sub.id === subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      // Call the service to cancel
      const result = await cancelSubscription(subscriptionId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel subscription');
      }
      
      // Update the subscription in our store
      const updatedSubscriptions = get().subscriptions.map(sub => {
        if (sub.id === subscriptionId) {
          return {
            ...sub,
            status: 'cancelling',
            is_active: true // Still active until period ends
          };
        }
        return sub;
      });
      
      const hasActive = updatedSubscriptions.some(isSubscriptionActive);
      
      set({ 
        subscriptions: updatedSubscriptions,
        hasActiveSubscription: hasActive,
        cancellingId: null
      });
      
      return true;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error cancelling subscription',
        cancellingId: null
      });
      return false;
    }
  },
  
  syncSubscriptionStatuses: async (userId: string) => {
    // Prevent multiple sync operations
    if (get().syncingSubscriptions) {
      return false;
    }
    
    try {
      set({ syncingSubscriptions: true, error: null });
      
      // Call the status sync API
      const response = await fetch('/api/stripe/subscriptions/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) {
        let errorMessage = `Server returned ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the response, just use the status code message
        }
        throw new Error(`Failed to sync subscription statuses: ${errorMessage}`);
      }
      
      // Parse response if available
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing subscription sync response:", parseError);
      }
      
      // Refresh subscriptions after sync - with force refresh since we're setting a different userId
      // to bypass the lastFetchedUserId check
      const currentUserId = get().lastFetchedUserId;
      set({ lastFetchedUserId: null }); // Reset to force a refresh
      
      if (currentUserId) {
        await get().fetchUserSubscriptions(currentUserId);
      }
      
      set({ syncingSubscriptions: false });
      return true;
    } catch (error) {
      console.error('Error syncing subscription statuses:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error syncing statuses',
        syncingSubscriptions: false
      });
      return false;
    }
  }
}));