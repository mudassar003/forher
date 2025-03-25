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
      // First, try to fetch from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId);
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // If we have data from Supabase, use it
      if (supabaseData && supabaseData.length > 0) {
        // Transform data to our Subscription format
        const subscriptionsData: Subscription[] = supabaseData.map(sub => ({
          id: sub.id,
          plan_name: sub.plan_name,
          status: sub.status,
          billing_amount: sub.billing_amount,
          billing_period: sub.billing_period,
          next_billing_date: sub.next_billing_date,
          start_date: sub.start_date,
          totalUsers: 0, // This is just a placeholder
          products: [], // Fetch products if needed
          appointmentsIncluded: sub.appointments_included || 0,
          appointmentsUsed: sub.appointments_used || 0
        }));
        
        set({ 
          subscriptions: subscriptionsData,
          hasActiveSubscription: subscriptionsData.some(sub => sub.status.toLowerCase() === 'active')
        });
      } else {
        // If no data from Supabase, fallback to static data for development
        // In production, you'd want to handle this differently
        set({
          subscriptions: [
            {
              id: "sub_1",
              plan_name: "Hair Growth Premium",
              status: "Active",
              billing_amount: 89.99,
              billing_period: "monthly",
              next_billing_date: "2025-04-15",
              start_date: "2025-01-15",
              totalUsers: 2854,
              appointmentsIncluded: 1,
              appointmentsUsed: 0,
              products: [
                {
                  id: "prod_1",
                  name: "Hair Growth Serum",
                  quantity: 1,
                  image: null,
                },
                {
                  id: "prod_2",
                  name: "Biotin Supplement",
                  quantity: 1,
                  image: null,
                }
              ]
            }
          ],
          hasActiveSubscription: true // For development
        });
      }
      
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ loading: false });
    }
  },
  
  fetchUserAppointments: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      // First, try to fetch from Supabase
      const { data: supabaseData, error: supabaseError } = await supabase
        .from('user_appointments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      // If we have data from Supabase, use it
      if (supabaseData && supabaseData.length > 0) {
        // Transform data to our Appointment format
        const appointmentsData: Appointment[] = supabaseData.map(apt => ({
          id: apt.id,
          treatment_name: apt.treatment_name,
          appointment_date: apt.appointment_date,
          status: apt.status,
          created_at: apt.created_at,
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
      } else {
        // If no data from Supabase, fallback to static data for development
        set({
          appointments: [
            {
              id: "1",
              treatment_name: "Hair Regrowth Consultation",
              appointment_date: "2025-03-20T10:00:00",
              status: "Scheduled",
              created_at: "2025-03-01T15:00:00",
              notes: "Initial consultation for hair regrowth treatment. Please arrive 15 minutes early to complete paperwork."
            },
            {
              id: "2",
              treatment_name: "Weight Loss Consultation",
              appointment_date: "2025-03-25T14:00:00",
              status: "Confirmed",
              created_at: "2025-03-02T16:00:00",
              notes: "Follow-up appointment to discuss progress and adjust treatment plan if necessary."
            },
            {
              id: "3",
              treatment_name: "Skin Care Treatment",
              appointment_date: "2025-03-10T13:30:00",
              status: "Completed",
              created_at: "2025-02-28T09:15:00",
              notes: "Completed facial treatment with recommended products for continued home care."
            },
          ],
          hasActiveAppointment: true // For development
        });
      }
      
      // After fetching both subscriptions and appointments, determine if user can access appointment page
      const { hasActiveSubscription, hasActiveAppointment } = get();
      set({
        canAccessAppointmentPage: hasActiveSubscription || hasActiveAppointment
      });
      
    } catch (error) {
      console.error('Error fetching appointments:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
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