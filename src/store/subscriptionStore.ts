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

// Helper function to check if a subscription is active
const isSubscriptionActive = (subscription: Subscription): boolean => {
  const activeStatuses = ['active', 'trialing', 'past_due'];
  return activeStatuses.includes(subscription.status.toLowerCase()) && subscription.is_active === true;
};

// 🚀 NEW: Broadcast subscription status change to other tabs
function broadcastSubscriptionChange(): void {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('subscription_status');
      channel.postMessage({
        type: 'SUBSCRIPTION_STATUS_CHANGE',
        action: 'status_changed',
        timestamp: Date.now()
      });
      channel.close();
      console.log('📡 Broadcasted subscription status change from store');
    } catch (error) {
      console.warn('Failed to broadcast subscription change from store:', error);
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
      
      setSubscriptions: (subscriptions: Subscription[]) => {
        const hasActive = subscriptions.some(isSubscriptionActive);
        const previousHasActive = get().hasActiveSubscription;
        
        set({ 
          subscriptions,
          hasActiveSubscription: hasActive
        });

        // 🚀 NEW: Broadcast if active status changed
        if (hasActive !== previousHasActive) {
          broadcastSubscriptionChange();
        }
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
      },
      
      fetchUserSubscriptions: async (userId: string, forceRefresh: boolean = false) => {
        // Skip if we're already loading 
        if (get().loading) {
          return;
        }
        
        // Check if we've synced recently (within 2 minutes) and no force refresh
        const lastSync = get().lastSyncTime;
        const now = Date.now();
        const twoMinutes = 2 * 60 * 1000; // Reduced from 5 minutes to 2 minutes
        
        if (lastSync && now - lastSync < twoMinutes && get().isFetched && !forceRefresh && get().subscriptions.length > 0) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          // Fetch from Supabase
          const { data: supabaseData, error: supabaseError } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
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
          const previousHasActive = get().hasActiveSubscription;
          
          // Update the store with the fetched data
          set({ 
            subscriptions: subscriptionsData,
            hasActiveSubscription: hasActive,
            loading: false,
            isFetched: true,
            lastSyncTime: now,
            error: null
          });

          // 🚀 NEW: Broadcast if active status changed
          if (hasActive !== previousHasActive) {
            broadcastSubscriptionChange();
          }
          
          // Check for any issues that might need syncing
          const needsSync = subscriptionsData.some(sub => {
            const isPending = sub.status.toLowerCase() === 'pending';
            const hasStripeId = !!sub.stripe_subscription_id;
            const isInconsistent = (sub.status.toLowerCase() === 'active' && !sub.is_active) || 
                                  (sub.status.toLowerCase() !== 'active' && sub.is_active);
            
            return (isPending && hasStripeId) || isInconsistent;
          });
          
          // Auto-sync if we detect issues, but don't wait for it to complete and don't trigger re-renders
          if (needsSync && !get().syncingSubscriptions) {
            // This runs in the background
            get().syncSubscriptionStatuses(userId).catch(() => {
              // Silently handle sync errors to avoid affecting UI
            });
          }
          
        } catch (error) {
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
          const previousHasActive = get().hasActiveSubscription;
          
          set({ 
            subscriptions: updatedSubscriptions,
            hasActiveSubscription: hasActive,
            cancellingId: null,
            lastSyncTime: Date.now() // Update sync time since we made a change
          });

          // 🚀 NEW: Broadcast if active status changed (cancellation usually changes this)
          if (hasActive !== previousHasActive) {
            broadcastSubscriptionChange();
          }
          
          return true;
        } catch (error) {
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
            await response.json();
          } catch (parseError) {
            // Response parsing not critical for sync operation
          }
          
          // Refresh subscriptions after sync - with force refresh
          await get().fetchUserSubscriptions(userId, true);
          
          set({ 
            syncingSubscriptions: false,
            lastSyncTime: Date.now() // Update last sync time
          });
          return true;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Unknown error syncing statuses',
            syncingSubscriptions: false
          });
          return false;
        }
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