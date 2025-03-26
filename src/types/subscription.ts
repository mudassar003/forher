//src/types/subscription.ts

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