// src/store/subscriptionStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { cancelSubscription } from '@/services/subscriptionService';
import { AppointmentStatus, PaymentStatus, QualiphyExamStatus } from '@/types/appointment';

// Define types for our subscription and appointment data
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

export interface Appointment {
  id: string;
  treatment_name: string;
  appointment_date?: string;
  status: AppointmentStatus;
  created_at: string;
  notes?: string;
  qualiphyMeetingUrl?: string;
  qualiphyMeetingUuid?: string;
  qualiphyPatientExamId?: number;
  qualiphyExamId?: number;
  qualiphyExamStatus?: QualiphyExamStatus;
  qualiphyProviderName?: string;
  payment_status?: PaymentStatus;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  requires_subscription: boolean;
}

interface UserSubscriptionState {
  subscriptions: Subscription[];
  appointments: Appointment[];
  hasActiveSubscription: boolean;
  hasActiveAppointment: boolean;
  canAccessAppointmentPage: boolean;
  loading: boolean;
  refreshingAppointments: boolean;
  error: string | null;
  cancellingId: string | null;
  syncingSubscriptions: boolean;
  
  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  fetchUserAppointments: (userId: string) => Promise<void>;
  refreshUserAppointments: (userId: string) => Promise<void>;
  checkUserAccess: (userId: string) => Promise<boolean>;
  cancelUserSubscription: (subscriptionId: string) => Promise<boolean>;
  syncSubscriptionStatuses: (userId: string) => Promise<boolean>;
  syncAppointmentStatuses: (appointmentId?: string, userId?: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  appointments: [],
  hasActiveSubscription: false,
  hasActiveAppointment: false,
  canAccessAppointmentPage: false,
  loading: false,
  refreshingAppointments: false,
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
        appointment_date: apt.appointment_date || apt.scheduled_date,
        status: apt.status || 'scheduled',
        created_at: apt.created_at || new Date().toISOString(),
        notes: apt.notes,
        qualiphyMeetingUrl: apt.qualiphy_meeting_url,
        qualiphyMeetingUuid: apt.qualiphy_meeting_uuid,
        qualiphyPatientExamId: apt.qualiphy_patient_exam_id,
        qualiphyExamId: apt.qualiphy_exam_id,
        qualiphyExamStatus: apt.qualiphy_exam_status,
        qualiphyProviderName: apt.qualiphy_provider_name,
        payment_status: apt.payment_status,
        payment_method: apt.payment_method,
        stripe_payment_intent_id: apt.stripe_payment_intent_id,
        stripe_session_id: apt.stripe_session_id,
        requires_subscription: apt.requires_subscription || false
      }));
      
      const hasActiveAppointment = appointmentsData.some(apt => 
        apt.status !== 'completed' && 
        apt.status !== 'cancelled' &&
        apt.payment_status === 'paid' &&
        apt.qualiphyExamStatus === 'N/A' // ONLY N/A status is valid for appointment access
      );
      
      // Check if we have any appointments that need syncing (pending payment or missing status)
      const needsSyncing = appointmentsData.some(apt => 
        (apt.payment_status === 'pending' && apt.stripe_session_id) ||
        (apt.payment_status === 'paid' && 
         (!apt.qualiphyExamStatus || apt.qualiphyExamStatus === 'N/A') && 
         apt.qualiphyExamId)
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
      
      // If we detected appointments that need syncing, trigger a sync in the background
      if (needsSyncing) {
        console.log("Found appointments that need syncing, syncing in background");
        // Don't await this to keep the UI responsive
        get().syncAppointmentStatuses(undefined, userId);
      }
      
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
  
  refreshUserAppointments: async (userId: string) => {
    set({ refreshingAppointments: true });
    
    try {
      // First sync appointment statuses with Qualiphy and Stripe
      await get().syncAppointmentStatuses(undefined, userId);
      
      // Then fetch the updated appointment data
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_appointments')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Transform data with the same logic as fetchUserAppointments
      const appointmentsData: Appointment[] = (supabaseData || []).map(apt => ({
        id: apt.id,
        treatment_name: apt.treatment_name || 'Consultation',
        appointment_date: apt.appointment_date || apt.scheduled_date,
        status: apt.status || 'scheduled',
        created_at: apt.created_at || new Date().toISOString(),
        notes: apt.notes,
        qualiphyMeetingUrl: apt.qualiphy_meeting_url,
        qualiphyMeetingUuid: apt.qualiphy_meeting_uuid,
        qualiphyPatientExamId: apt.qualiphy_patient_exam_id,
        qualiphyExamId: apt.qualiphy_exam_id,
        qualiphyExamStatus: apt.qualiphy_exam_status,
        qualiphyProviderName: apt.qualiphy_provider_name,
        payment_status: apt.payment_status,
        payment_method: apt.payment_method,
        stripe_payment_intent_id: apt.stripe_payment_intent_id,
        stripe_session_id: apt.stripe_session_id,
        requires_subscription: apt.requires_subscription || false
      }));
      
      const hasActiveAppointment = appointmentsData.some(apt => 
        apt.status !== 'completed' && 
        apt.status !== 'cancelled' &&
        apt.payment_status === 'paid' &&
        apt.qualiphyExamStatus === 'N/A' // ONLY N/A status is valid for appointment access
      );
      
      set({ 
        appointments: appointmentsData,
        hasActiveAppointment,
        refreshingAppointments: false
      });
      
      // Update canAccessAppointmentPage flag
      const { hasActiveSubscription } = get();
      set({
        canAccessAppointmentPage: hasActiveSubscription || hasActiveAppointment
      });
      
    } catch (error) {
      console.error('Error refreshing appointments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error refreshing appointments',
        refreshingAppointments: false
      });
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
  },
  
  syncAppointmentStatuses: async (appointmentId?: string, userId?: string) => {
    try {
      // Get the current user ID if not provided
      const currentUserId = userId || get().subscriptions[0]?.user_id;
      
      // Create the request body based on whether we're syncing a specific appointment
      const requestBody = appointmentId 
        ? JSON.stringify({ appointmentId }) 
        : currentUserId 
          ? JSON.stringify({ userId: currentUserId }) 
          : JSON.stringify({}); // Fallback
      
      // Call the appointment status sync API
      const response = await fetch('/api/appointments/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Appointment sync error details:", errorData);
        // Don't throw error to avoid breaking the UI, but log it
        console.error(`Failed to sync appointment statuses: ${errorData.error || 'Unknown error'}`);
        return false;
      }
      
      const result = await response.json();
      console.log("Appointment sync result:", result);
      
      // Check if we had any status changes that warrant a refresh
      const hasChanges = result.results?.some((r: any) => 
        r.success && (r.changes?.stripe || r.changes?.qualiphy)
      );
      
      if (hasChanges && currentUserId) {
        console.log("Found status changes, refreshing appointments");
        // Wait a short time to ensure backend updates are committed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refetch appointments with the updated statuses
        const { data: refreshedData, error: refreshError } = await supabase
          .from('user_appointments')
          .select('*')
          .eq('user_id', currentUserId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false });
          
        if (!refreshError && refreshedData) {
          // Transform and update appointment data
          const appointmentsData: Appointment[] = refreshedData.map(apt => ({
            id: apt.id,
            treatment_name: apt.treatment_name || 'Consultation',
            appointment_date: apt.appointment_date || apt.scheduled_date,
            status: apt.status || 'scheduled',
            created_at: apt.created_at || new Date().toISOString(),
            notes: apt.notes,
            qualiphyMeetingUrl: apt.qualiphy_meeting_url,
            qualiphyMeetingUuid: apt.qualiphy_meeting_uuid,
            qualiphyPatientExamId: apt.qualiphy_patient_exam_id,
            qualiphyExamId: apt.qualiphy_exam_id,
            qualiphyExamStatus: apt.qualiphy_exam_status,
            qualiphyProviderName: apt.qualiphy_provider_name,
            payment_status: apt.payment_status,
            payment_method: apt.payment_method,
            stripe_payment_intent_id: apt.stripe_payment_intent_id,
            stripe_session_id: apt.stripe_session_id,
            requires_subscription: apt.requires_subscription || false
          }));
          
          // Update appointments in the store
          set({ 
            appointments: appointmentsData,
            // Update hasActiveAppointment based on refreshed data
            hasActiveAppointment: appointmentsData.some(apt => 
              apt.status !== 'completed' && 
              apt.status !== 'cancelled' &&
              apt.payment_status === 'paid' &&
              apt.qualiphyExamStatus === 'N/A' // ONLY N/A status is valid for appointment access
            )
          });
          
          // Update canAccessAppointmentPage flag
          const { hasActiveSubscription, hasActiveAppointment } = get();
          set({
            canAccessAppointmentPage: hasActiveSubscription || hasActiveAppointment
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error syncing appointment statuses:', error);
      return false;
    }
  }
}));