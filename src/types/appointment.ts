// src/types/appointment.ts
export type AppointmentStatus = 
  | 'pending'
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'
  | 'no-show';

export type QualiphyExamStatus = 
  | 'Approved'
  | 'Deferred'
  | 'N/A'
  | 'Pending';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface AppointmentType {
  id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  stripePriceId?: string;
  stripeProductId?: string;
  qualiphyExamId?: number;
  isActive: boolean;
  requiresSubscription: boolean;
  image?: any;
}

export interface DbAppointment {
  id: string;
  user_id: string;
  user_email: string;
  customer_name?: string;
  treatment_name: string;
  appointment_date?: string;
  status: AppointmentStatus;
  appointment_type_id: string;
  sanity_id?: string;
  order_id?: string;
  subscription_id?: string;
  is_from_subscription: boolean;
  scheduled_date?: string;
  completed_date?: string;
  qualiphy_meeting_url?: string;
  qualiphy_meeting_uuid?: string;
  qualiphy_patient_exam_id?: number;
  qualiphy_exam_id?: number;
  qualiphy_exam_status?: QualiphyExamStatus;
  qualiphy_provider_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  price?: number;
  duration?: number;
  stripe_session_id?: string;
  stripe_customer_id?: string;
  payment_status?: PaymentStatus;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  prescription_id?: string;
  prescription_details?: any;
  requires_subscription?: boolean;
}

export interface AppointmentPurchaseOptions {
  useSubscription?: boolean;
  subscriptionId?: string;
}

export interface AppointmentPurchaseParams {
  appointmentId: string;
  userId: string;
  userEmail: string;
  userName?: string;
  subscriptionId?: string;
}

export interface AppointmentPurchaseResult {
  success: boolean;
  appointmentId?: string;
  sessionId?: string;
  url?: string;
  error?: string;
}