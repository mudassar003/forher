//src/types/subscription.ts

// src/types/subscription.ts
// Updated subscription types with appointment access tracking

export interface UserSubscription {
  id: string;
  user_id: string;
  subscription_id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  // New appointment access fields
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number; // in seconds
}

export interface AppointmentAccessStatus {
  hasAccess: boolean;
  isExpired: boolean;
  isFirstAccess: boolean;
  accessedAt: string | null;
  timeRemaining: number; // in seconds, 0 if expired
  accessDuration: number; // total allowed duration in seconds
  expiresAt: string | null;
  needsSupportContact: boolean;
}

export interface AppointmentAccessResponse {
  success: boolean;
  message: string;
  data: AppointmentAccessStatus;
  error?: string;
}

export interface GrantAccessRequest {
  userId: string;
  subscriptionId: string;
  accessDuration?: number; // optional override, defaults to 600 seconds (10 minutes)
}

export interface GrantAccessResponse {
  success: boolean;
  message: string;
  data: {
    accessGrantedAt: string;
    expiresAt: string;
    duration: number;
  };
  error?: string;
}

// Define subscription status types
export type SubscriptionStatus = 
  | 'active'
  | 'cancelled'
  | 'cancelling'
  | 'pending'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'expired'
  | 'paused'
  | 'unpaid';

// Define billing period types
export type BillingPeriod = 
  | 'monthly'
  | 'quarterly'
  | 'annually';

// Database subscription type
export interface DbSubscription {
  id: string;
  user_id: string;
  user_email: string;
  plan_id: string;
  plan_name: string;
  subscription_name: string;
  sanity_id?: string;
  sanity_subscription_id?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  stripe_session_id?: string;
  billing_amount: number;
  billing_period: BillingPeriod;
  next_billing_date?: string;
  start_date: string;
  end_date?: string;
  status: SubscriptionStatus;
  is_active: boolean;
  has_appointment_access: boolean;
  appointment_discount_percentage: number;
  appointments_included?: number;
  appointments_used?: number;
  cancellation_date?: string;
  created_at: string;
  updated_at: string;
}

// API types for subscription actions
export interface CancelSubscriptionRequest {
  subscriptionId: string; // The Stripe subscription ID
}

export interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
}