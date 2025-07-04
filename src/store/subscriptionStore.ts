// src/store/subscriptionStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  end_date?: string;
  cancellation_date?: string;
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
  isFetched: boolean; // Track if we've fetched at least once
  lastSyncTime: number | null; // Track the last time we synced
  
  // Actions
  fetchUserSubscriptions: (userId: string, forceRefresh?: boolean) => Promise<void>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
  setSubscriptions: (subscriptions: Subscription[]) => void;
  resetSubscriptionStore: () => void;
}

// Helper function to check if a subscription is currently active
const isSubscriptionActive = (subscription: Subscription): boolean => {
  // A subscription is active if:
  // 1. It has an active status AND is_active is true
  // 2. OR it's in a grace period (past_due but still active)
  // 3. OR it's trialing and is_active is true
  return (
    subscription.is_active === true &&
    ['active', 'trialing', 'past_due'].includes(subscription.status?.toLowerCase() || '')
  );
};

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
function broadcastSubscriptionChange(action?: string): void {
  const channel = createBroadcastChannel();
  if (channel) {
    try {
      channel.postMessage({
        type: 'SUBSCRIPTION_STATUS_CHANGE',
        action: action || 'updated',
        timestamp: Date.now()
      });
      channel.close(); // Clean up immediately
      console.log(`📡 Broadcasted subscription change to other tabs`);
    } catch (error) {
      console.warn('Failed to broadcast subscription change:', error);
    }
  }
}

export const useSubscriptionStore = create<UserSubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: [],
      hasActiveSubscription: false,
      loading: false,
      error: null,
      cancellingId: null,
      syncingSubscriptions: false,
      isFetched: false,
      lastSyncTime: null,
      
      fetchUserSubscriptions: async (userId: string, forceRefresh: boolean = false) => {
        // Prevent duplicate calls unless forcing refresh
        if (get().loading && !forceRefresh) {
          console.log('🔄 Fetch already in progress, skipping...');
          return;
        }
        
        // If we have recent data and not forcing refresh, skip
        const now = Date.now();
        const lastSync = get().lastSyncTime;
        const hasRecentData = lastSync && (now - lastSync) < 30000; // 30 seconds
        
        if (get().isFetched && hasRecentData && !forceRefresh) {
          console.log('📦 Using cached subscription data');
          return;
        }
        
        try {
          set({ loading: true, error: null });
          console.log(`🔄 Fetching subscriptions for user: ${userId}${forceRefresh ? ' (forced refresh)' : ''}`);
          
          // Fetch from Supabase - removed appointment-related columns
          const { data: supabaseData, error: supabaseError } = await supabase
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
              cancellation_date,
              created_at,
              updated_at
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false }); // Most recent first
          
          if (supabaseError) {
            throw new Error(supabaseError.message);
          }
          
          console.log(`📊 Fetched ${supabaseData?.length || 0} total subscriptions for user ${userId}`);
          
          // Transform data to our Subscription format
          const subscriptionsData: Subscription[] = (supabaseData || []).map(sub => ({
            id: sub.id,
            user_id: sub.user_id,
            plan_name: sub.plan_name || sub.subscription_name || 'Subscription',
            status: sub.status || 'unknown',
            is_active: sub.is_active === true, // Ensure boolean type
            billing_amount: sub.billing_amount || 0,
            billing_period: sub.billing_period || 'monthly',
            next_billing_date: sub.next_billing_date || sub.end_date || new Date().toISOString(),
            start_date: sub.start_date || new Date().toISOString(),
            end_date: sub.end_date,
            cancellation_date: sub.cancellation_date,
            totalUsers: 0, // Optional metadata
            products: [], // Could be populated from another query if needed
            stripe_subscription_id: sub.stripe_subscription_id,
            sanity_id: sub.sanity_id
          }));
          
          // Debug logging
          const statusCounts = subscriptionsData.reduce((acc, sub) => {
            acc[sub.status] = (acc[sub.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          console.log('📊 Subscription status breakdown:', statusCounts);
          
          // Check for active subscriptions using the helper function
          const activeSubscriptions = subscriptionsData.filter(isSubscriptionActive);
          const hasActive = activeSubscriptions.length > 0;
          const previousHasActive = get().hasActiveSubscription;
          
          console.log(`✅ Found ${activeSubscriptions.length} active subscriptions out of ${subscriptionsData.length} total`);
          
          // Update the store with ALL subscription data
          set({ 
            subscriptions: subscriptionsData, // Show ALL subscriptions (active, cancelled, pending, etc.)
            hasActiveSubscription: hasActive,
            loading: false,
            isFetched: true,
            lastSyncTime: now,
            error: null
          });

          // 🚀 Broadcast if active status changed
          if (hasActive !== previousHasActive) {
            broadcastSubscriptionChange();
          }
          
        } catch (error) {
          console.error('❌ Error fetching subscriptions:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error fetching subscriptions',
            loading: false,
            isFetched: true
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
          
          console.log(`🗑️ Cancelling subscription: ${subscriptionId} (${subscription.plan_name})`);
          
          // Call the service to cancel (immediate cancellation)
          const result = await cancelSubscription(subscriptionId);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to cancel subscription');
          }
          
          // Immediately update the subscription in our store to show as cancelled
          const updatedSubscriptions = get().subscriptions.map(sub => {
            if (sub.id === subscriptionId) {
              return {
                ...sub,
                status: 'cancelled',
                is_active: false, // Immediately set to inactive
                cancellation_date: new Date().toISOString(),
                end_date: new Date().toISOString()
              };
            }
            return sub;
          });
          
          const hasActive = updatedSubscriptions.some(isSubscriptionActive);
          const previousHasActive = get().hasActiveSubscription;
          
          set({ 
            subscriptions: updatedSubscriptions, // Keep the subscription in the list, just update its status
            hasActiveSubscription: hasActive,
            cancellingId: null,
            lastSyncTime: Date.now() // Update sync time since we made a change
          });

          // 🚀 Broadcast the change
          if (hasActive !== previousHasActive) {
            broadcastSubscriptionChange();
          }
          
          console.log(`✅ Subscription ${subscriptionId} cancelled and updated in store`);
          
          return true;
        } catch (error) {
          console.error('❌ Error cancelling subscription:', error);
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
          
          console.log('🔄 Syncing subscription statuses with Stripe...');
          
          // Call the status sync API
          const response = await fetch('/api/stripe/subscriptions/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
            credentials: 'include' // Include cookies for auth
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
          try {
            const result = await response.json();
            console.log('✅ Sync completed:', result);
          } catch (parseError) {
            // Response parsing not critical for sync operation
            console.log('✅ Sync completed (response not parseable)');
          }
          
          // Refresh subscriptions after sync - with force refresh
          await get().fetchUserSubscriptions(userId, true);
          
          set({ 
            syncingSubscriptions: false,
            lastSyncTime: Date.now() // Update last sync time
          });
          return true;
        } catch (error) {
          console.error('❌ Error syncing subscription statuses:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error syncing statuses',
            syncingSubscriptions: false
          });
          return false;
        }
      },
      
      setSubscriptions: (subscriptions: Subscription[]) => {
        const hasActive = subscriptions.some(isSubscriptionActive);
        set({ 
          subscriptions, 
          hasActiveSubscription: hasActive,
          lastSyncTime: Date.now()
        });
      },
      
      resetSubscriptionStore: () => {
        set({
          subscriptions: [],
          hasActiveSubscription: false,
          loading: false,
          error: null,
          cancellingId: null,
          syncingSubscriptions: false,
          isFetched: false,
          lastSyncTime: null
        });
      }
    }),
    {
      name: 'subscription-storage', // Name for the storage
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for persistence
      partialize: (state) => ({ 
        subscriptions: state.subscriptions,
        hasActiveSubscription: state.hasActiveSubscription,
        isFetched: state.isFetched,
        lastSyncTime: state.lastSyncTime
      }), // Only persist these fields
    }
  )
);