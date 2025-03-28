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
  appointmentsIncluded: number;
  appointmentsUsed: number;
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
  
  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  hasActiveSubscription: false,
  loading: false,
  error: null,
  cancellingId: null,
  syncingSubscriptions: false,
  
  fetchUserSubscriptions: async (userId: string) => {
    set({ loading: true, error: null });
    
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
        is_active: sub.is_active || false,
        billing_amount: sub.billing_amount || 0,
        billing_period: sub.billing_period || 'monthly',
        next_billing_date: sub.next_billing_date || sub.end_date || new Date().toISOString(),
        start_date: sub.start_date || new Date().toISOString(),
        totalUsers: 0, // Optional metadata
        products: [], // Could be populated from another query if needed
        appointmentsIncluded: sub.appointments_included || 0,
        appointmentsUsed: sub.appointments_used || 0,
        stripe_subscription_id: sub.stripe_subscription_id,
        sanity_id: sub.sanity_id
      }));
      
      // Check if any subscription has a pending status but should be active
      const hasPendingSubscriptions = subscriptionsData.some(sub => 
        sub.status.toLowerCase() === 'pending'
      );
      
      // Check for any inconsistencies between status and is_active
      const hasInconsistentSubscriptions = subscriptionsData.some(sub => 
        (sub.status.toLowerCase() === 'active' && !sub.is_active) ||
        (sub.status.toLowerCase() !== 'active' && sub.is_active)
      );
      
      // Check if any subscription has stripe_subscription_id but still shows pending status
      const hasUnprocessedSubscriptions = subscriptionsData.some(sub => 
        sub.status.toLowerCase() === 'pending' && !!sub.stripe_subscription_id
      );
      
      set({ 
        subscriptions: subscriptionsData,
        hasActiveSubscription: subscriptionsData.some(sub => 
          (sub.status.toLowerCase() === 'active' || 
           sub.status.toLowerCase() === 'trialing' || 
           sub.status.toLowerCase() === 'past_due' || 
           sub.status.toLowerCase() === 'cancelling') && 
          sub.is_active === true
        )
      });
      
      // Auto-sync if we detect issues
      if (hasUnprocessedSubscriptions || hasInconsistentSubscriptions || hasPendingSubscriptions) {
        console.log("Found subscription inconsistencies or pending subscriptions, automatically syncing status");
        // This will trigger in the background, we don't await it
        get().syncSubscriptionStatuses(userId);
      }
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error fetching subscriptions',
        subscriptions: []
      });
    } finally {
      set({ loading: false });
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
      
      set({ 
        subscriptions: updatedSubscriptions,
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
      
      let result;
      
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("Error parsing subscription sync response:", parseError);
        throw new Error('Failed to parse server response');
      }
      
      if (!response.ok) {
        console.error("Subscription sync error details:", result);
        throw new Error(result?.error || `Server returned ${response.status}: Failed to sync subscription statuses`);
      }
      
      console.log("Subscription sync result:", result);
      
      // Refresh subscriptions after sync
      await get().fetchUserSubscriptions(userId);
      
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