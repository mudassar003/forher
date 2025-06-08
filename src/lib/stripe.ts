// src/lib/stripe.ts
import Stripe from 'stripe';

// Validate environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not defined');
}

// Initialize Stripe - omitting apiVersion uses the latest version automatically
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Types
export interface CreateCheckoutSessionParams {
  lineItems: Array<{
    price_data: {
      currency: string;
      product_data: {
        name: string;
        images?: string[];
      };
      unit_amount: number; // Price in cents
    };
    quantity: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  mode?: 'payment' | 'subscription' | 'setup';
}

export interface CreateSubscriptionCheckoutParams {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  subscriptionData?: {
    metadata?: Record<string, string>;
  };
}

/**
 * Creates a Stripe checkout session for one-time payments
 */
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  metadata = {},
  customerEmail,
  mode = 'payment',
}: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: customerEmail,
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Creates a Stripe checkout session for subscriptions
 */
export async function createSubscriptionCheckoutSession({
  priceId,
  successUrl,
  cancelUrl,
  metadata = {},
  customerEmail,
  subscriptionData,
}: CreateSubscriptionCheckoutParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
      customer_email: customerEmail,
      subscription_data: subscriptionData,
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription checkout session:', error);
    throw error;
  }
}

/**
 * Retrieves a checkout session by ID
 */
export async function retrieveCheckoutSession(sessionId: string) {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'subscription'],
    });
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    throw error;
  }
}

/**
 * Constructs the Stripe webhook event
 */
export async function constructWebhookEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not defined');
  }
  
  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Error constructing webhook event:', error);
    throw error;
  }
}

/**
 * Create a Stripe customer
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  try {
    return await stripe.customers.create(params);
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

/**
 * Retrieve a Stripe customer
 */
export async function retrieveCustomer(customerId: string) {
  try {
    return await stripe.customers.retrieve(customerId);
  } catch (error) {
    console.error('Error retrieving customer:', error);
    throw error;
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(params: {
  customer: string;
  items: Array<{ price: string; quantity?: number }>;
  metadata?: Record<string, string>;
}) {
  try {
    return await stripe.subscriptions.create(params);
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

/**
 * Retrieve a subscription
 */
export async function retrieveSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
}

export default stripe;