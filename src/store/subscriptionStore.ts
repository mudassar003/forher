// src/store/subscriptionStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { cancelSubscription } from '@/services/subscriptionService';
import { SubscriptionStatus, BillingPeriod } from '@/types/subscription';

// Define types for our subscription and appointment data
export interface Subscription {
  id: string;
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

export interface Appointment {
  id: string;
  treatment_name: string;
  appointment_date: string;
  status: string;
  created_at: string;
  notes?: string;
  qualiphyMeetingUrl?: string;
  qualiphyMeetingUuid?: string;
  qualiphyPatientExamId?: number;
  qualiphyExamId?: number;
  qualiphyExamStatus?: string;
}

interface UserSubscriptionState {
  subscriptions: Subscription[];
  appointments: Appointment[];
  hasActiveSubscription: boolean;
  hasActiveAppointment: boolean;
  canAccessAppointmentPage: boolean;
  loading: boolean;
  error: string | null;
  cancellingId: string | null;
  syncingSubscriptions: boolean;
  
  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  fetchUserAppointments: (userId: string) => Promise<void>;
  checkUserAccess: (userId: string) => Promise<boolean>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  appointments: [],
  hasActiveSubscription: false,
  hasActiveAppointment: false,
  canAccessAppointmentPage: false,
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
      if (hasUnprocessedSubscriptions || hasInconsistentSubscriptions) {
        console.log("Found subscription inconsistencies, automatically syncing status");
        // This will trigger in the background, we don't await it
        get().syncSubscriptionStatuses(userId);
      }
      // If there are just regular pending subscriptions, also try to sync
      else if (hasPendingSubscriptions) {
        console.log("Found pending subscriptions, syncing status");
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
  
  fetchUserAppointments: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      // Fetch from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_appointments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false) // Only fetch non-deleted appointments
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Transform data to our Appointment format
      const appointmentsData: Appointment[] = (supabaseData || []).map(apt => ({
        id: apt.id,
        treatment_name: apt.treatment_name || 'Consultation',
        appointment_date: apt.appointment_date || apt.scheduled_date || new Date().toISOString(),
        status: apt.status || 'scheduled',
        created_at: apt.created_at || new Date().toISOString(),
        notes: apt.notes,
        qualiphyMeetingUrl: apt.qualiphy_meeting_url,
        qualiphyMeetingUuid: apt.qualiphy_meeting_uuid,
        qualiphyPatientExamId: apt.qualiphy_patient_exam_id,
        qualiphyExamId: apt.qualiphy_exam_id,
        qualiphyExamStatus: apt.qualiphy_exam_status
      }));
      
      const hasActiveAppointment = appointmentsData.some(apt => 
        apt.status.toLowerCase() !== 'completed' && 
        apt.status.toLowerCase() !== 'cancelled'
      );
      
      set({ 
        appointments: appointmentsData,
        hasActiveAppointment
      });
      
      // After fetching both subscriptions and appointments, determine if user can access appointment page
      const { hasActiveSubscription } = get();
      set({
        canAccessAppointmentPage: hasActiveSubscription || hasActiveAppointment
      });
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error fetching appointments',
        appointments: []
      });
    } finally {
      set({ loading: false });
    }
  },
  
  checkUserAccess: async (userId: string) => {
    if (!userId) return false;
    
    try {
      // Load subscriptions and appointments if not already loaded
      if (get().subscriptions.length === 0) {
        await get().fetchUserSubscriptions(userId);
      }
      
      if (get().appointments.length === 0) {
        await get().fetchUserAppointments(userId);
      }
      
      const { hasActiveSubscription, hasActiveAppointment } = get();
      const canAccess = hasActiveSubscription || hasActiveAppointment;
      
      set({ canAccessAppointmentPage: canAccess });
      return canAccess;
      
    } catch (error) {
      console.error('Error checking user access:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error checking access',
        canAccessAppointmentPage: false 
      });
      return false;
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
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync subscription statuses');
      }
      
      const result = await response.json();
      console.log("Sync result:", result);
      
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