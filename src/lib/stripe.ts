// src/lib/stripe.ts
import Stripe from 'stripe';

// Initialize Stripe with your secret key
// Use environment variable for security
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Specify the Stripe API version
});

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
}

/**
 * Creates a Stripe checkout session
 */
export async function createCheckoutSession({
  lineItems,
  successUrl,
  cancelUrl,
  metadata = {},
  customerEmail,
}: CreateCheckoutSessionParams) {
  return stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    customer_email: customerEmail,
  });
}

/**
 * Retrieves a checkout session by ID
 */
export async function retrieveCheckoutSession(sessionId: string) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}

/**
 * Constructs the Stripe webhook event
 */
export async function constructWebhookEvent(payload: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export default stripe;