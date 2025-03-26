// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import stripe from "./utils/stripe-client";
import { StripeEventMap } from "./utils/types";

// Import handlers
import { handleCheckoutSession } from "./handlers/checkout";
import { 
  handleSubscriptionUpdated, 
  handleSubscriptionDeleted 
} from "./handlers/subscriptions";
import { 
  handleInvoicePaymentSucceeded, 
  handleInvoicePaymentFailed 
} from "./handlers/invoices";
import { 
  handlePaymentIntentSucceeded, 
  handlePaymentIntentFailed 
} from "./handlers/payments";

// This is needed to disable body parsing for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headerList = await headers();
    const signature = headerList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No Stripe signature found" }, { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Stripe webhook secret not configured" }, { status: 500 });
    }

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log(`⚡ Received Stripe webhook event: ${event.type}`);

    // Type the event data for enhanced type safety
    const eventType = event.type as keyof StripeEventMap;
    const eventData = event.data.object as StripeEventMap[typeof eventType];

    // Route the event to the appropriate handler
    switch (eventType) {
      case 'checkout.session.completed':
        return await handleCheckoutSession(eventData);
      
      case 'invoice.payment_succeeded':
        return await handleInvoicePaymentSucceeded(eventData);
      
      case 'invoice.payment_failed':
        return await handleInvoicePaymentFailed(eventData);
      
      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(eventData);
      
      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(eventData);
      
      case 'payment_intent.succeeded':
        return await handlePaymentIntentSucceeded(eventData);
      
      case 'payment_intent.payment_failed':
        return await handlePaymentIntentFailed(eventData);
      
      default:
        // Handle unimplemented event types
        console.log(`Ignoring unhandled event type: ${eventType}`);
        return NextResponse.json({ received: true });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Webhook handler failed";
    console.error(`Webhook Error: ${errorMessage}`);
    
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage
      }, 
      { status: 400 }
    );
  }
}