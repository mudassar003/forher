// src/app/api/stripe/webhook/utils/types.ts
import { Stripe } from 'stripe';

// Common interfaces for database operations
export interface SubscriptionUpdateData {
  status: string;
  is_active: boolean;
  updated_at: string;
  end_date?: string;
  next_billing_date?: string;
  stripe_subscription_id?: string;
  start_date?: string;
}

export interface SanitySubscriptionUpdateData {
  status: string;
  isActive: boolean;
  endDate?: string;
  nextBillingDate?: string;
  stripeSubscriptionId?: string;
}

export interface OrderUpdateData {
  status?: string;
  payment_method?: string;
  payment_status?: string;
  stripe_session_id?: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string | null;
  updated_at: string;
}

export interface SanityOrderUpdateData {
  status?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
}

// Event handler return type
export interface WebhookResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Common webhook metadata types
export interface CheckoutSessionMetadata {
  userId?: string;
  userEmail?: string;
  subscriptionId?: string;
  orderId?: string;
  sanityId?: string;
}

// Define known event types explicitly
export type StripeEventMap = {
  'checkout.session.completed': Stripe.Checkout.Session;
  'invoice.payment_succeeded': Stripe.Invoice;
  'invoice.payment_failed': Stripe.Invoice;
  'customer.subscription.updated': Stripe.Subscription;
  'customer.subscription.deleted': Stripe.Subscription;
  'payment_intent.succeeded': Stripe.PaymentIntent;
  'payment_intent.payment_failed': Stripe.PaymentIntent;
} & {
  // Use unknown instead of any for unhandled event types
  [key: string]: unknown;
};