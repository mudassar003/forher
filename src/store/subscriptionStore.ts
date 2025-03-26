// src/store/subscriptionStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

// Define types for our subscription and appointment data
export interface Subscription {
  id: string;
  plan_name: string;
  status: string;
  billing_amount: number;
  billing_period: string;
  next_billing_date: string;
  start_date: string;
  totalUsers: number;
  products: SubscriptionProduct[];
  appointmentsIncluded: number;
  appointmentsUsed: number;
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
  
  // Actions
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  fetchUserAppointments: (userId: string) => Promise<void>;
  checkUserAccess: (userId: string) => Promise<boolean>;
}

export const useSubscriptionStore = create<UserSubscriptionState>((set, get) => ({
  subscriptions: [],
  appointments: [],
  hasActiveSubscription: false,
  hasActiveAppointment: false,
  canAccessAppointmentPage: false,
  loading: false,
  error: null,
  
  fetchUserSubscriptions: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      // Fetch from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId);
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // Transform data to our Subscription format
      const subscriptionsData: Subscription[] = (supabaseData || []).map(sub => ({
        id: sub.id,
        plan_name: sub.plan_name || sub.subscription_name || 'Subscription',
        status: sub.status || 'Unknown',
        billing_amount: sub.billing_amount || 0,
        billing_period: sub.billing_period || 'monthly',
        next_billing_date: sub.next_billing_date || new Date().toISOString(),
        start_date: sub.start_date || new Date().toISOString(),
        totalUsers: 0, // Optional metadata
        products: [], // Could be populated from another query if needed
        appointmentsIncluded: sub.appointments_included || 0,
        appointmentsUsed: sub.appointments_used || 0
      }));
      
      set({ 
        subscriptions: subscriptionsData,
        hasActiveSubscription: subscriptionsData.some(sub => sub.status.toLowerCase() === 'active')
      });
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
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
      
      const hasActive = appointmentsData.some(apt => 
        apt.status.toLowerCase() !== 'completed' && 
        apt.status.toLowerCase() !== 'cancelled'
      );
      
      set({ 
        appointments: appointmentsData,
        hasActiveAppointment: hasActive
      });
      
      // After fetching both subscriptions and appointments, determine if user can access appointment page
      const { hasActiveSubscription } = get();
      set({
        canAccessAppointmentPage: hasActiveSubscription || hasActive
      });
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
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
        error: error instanceof Error ? error.message : 'Unknown error',
        canAccessAppointmentPage: false 
      });
      return false;
    }
  }
}));