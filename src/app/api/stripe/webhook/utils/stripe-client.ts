// src/app/api/stripe/webhook/utils/stripe-client.ts
import { Stripe } from 'stripe';

// Initialize and export the Stripe client
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not defined');
}

// Using undefined for apiVersion will automatically use the latest API version
// New default API version: 2025-02-24.acacia (because stripe has provided this new api version)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: undefined, // Use the latest API version automatically
});

export default stripe;