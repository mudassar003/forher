// src/app/api/stripe/webhook/handlers/checkout.ts
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import stripe from "../utils/stripe-client";
import { supabase, sanityClient } from "../utils/db-clients";
import { WebhookResponse, CheckoutSessionMetadata } from "../utils/types";
import {
  getSupabaseSubscription,
  getSupabaseAppointment,
  updateSupabaseSubscription,
  updateSanitySubscription,
  updateSupabaseAppointment,
  updateSanityAppointment,
  updateSupabaseOrder,
  updateSanityOrder
} from "../utils/db-operations";

/**
 * Handle Stripe checkout.session.completed event
 */
export async function handleCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<NextResponse> {
  console.log(`🔍 Processing checkout session: ${session.id}`);
  
  try {
    // Extract metadata
    const metadata = session.metadata as CheckoutSessionMetadata;
    const userId = metadata?.userId;
    const userEmail = metadata?.userEmail;
    const subscriptionId = metadata?.subscriptionId;
    const appointmentId = metadata?.appointmentId;
    const appointmentType = metadata?.appointmentType;
    const fromSubscription = metadata?.fromSubscription === 'true';
    const userSubscriptionId = metadata?.userSubscriptionId;
    const qualiphyExamId = metadata?.qualiphyExamId;
    const orderId = metadata?.orderId;
    const sanityId = metadata?.sanityId;

    // Get customer information if available
    let customerId = session.customer as string;
    if (!customerId && session.customer_details?.email) {
      customerId = await getOrCreateCustomer(session.customer_details);
    }
    
    // Check what type of purchase this is
    const isSubscription = session.mode === 'subscription';
    const isAppointment = appointmentType === 'oneTime';
    const isRegularOrder = orderId || sanityId;
    
    // Handle different purchase types
    if (isSubscription && subscriptionId) {
      await handleSubscriptionPurchase(session, subscriptionId);
    } else if (isAppointment && appointmentId) {
      await handleAppointmentPurchase(
        session, 
        appointmentId, 
        fromSubscription, 
        userSubscriptionId, 
        qualiphyExamId, 
        customerId
      );
    } else if (isRegularOrder) {
      await handleRegularOrderPurchase(session, orderId, sanityId, customerId);
    } else {
      console.log("Unidentified checkout session type or missing ID:", metadata);
    }

    return NextResponse.json({
      success: true,
      message: "Checkout session processed successfully"
    });
  } catch (error) {
    console.error("Error processing checkout session:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Error processing checkout session"
      }, 
      { status: 500 }
    );
  }
}

/**
 * Get or create a Stripe customer based on email
 */
async function getOrCreateCustomer(
  customerDetails: Stripe.Checkout.Session.CustomerDetails
): Promise<string> {
  try {
    const email = customerDetails.email;
    
    // Make sure we have an email
    if (!email) {
      throw new Error("Customer email is required");
    }
    
    // Try to find an existing customer - fixed params structure
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length > 0) {
      return customers.data[0].id;
    }
    
    // If not found, create a new one
    const customerParams: Stripe.CustomerCreateParams = {
      email: email,
    };
    
    // Add optional parameters only if they exist
    if (customerDetails.name) {
      customerParams.name = customerDetails.name;
    }
    
    if (customerDetails.phone) {
      customerParams.phone = customerDetails.phone;
    }
    
    const newCustomer = await stripe.customers.create(customerParams);
    
    return newCustomer.id;
  } catch (error) {
    console.error("Error creating/finding Stripe customer:", error);
    throw new Error(`Failed to get or create customer: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Handle subscription purchase
 */
async function handleSubscriptionPurchase(
  session: Stripe.Checkout.Session,
  subscriptionId: string
): Promise<void> {
  console.log(`Processing subscription purchase for ${subscriptionId}`);
  
  // Get Stripe subscription ID from the session
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  
  // Update Sanity user subscription
  try {
    const { data: sanityUserSub, error } = await supabase
      .from('user_subscriptions')
      .select('sanity_id')
      .eq('stripe_session_id', session.id)
      .single();
    
    if (error) {
      console.error("Error fetching user subscription:", error);
      throw error;
    }
    
    const userSubscriptionSanityId = sanityUserSub?.sanity_id;

    if (userSubscriptionSanityId) {
      // Calculate end date based on billing period
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      // Default to next month, but this will be overridden by actual subscription end date
      endDate.setMonth(endDate.getMonth() + 1);
      
      if (subscription.current_period_end) {
        endDate = new Date(subscription.current_period_end * 1000);
      }
      
      // Update Sanity user subscription
      await updateSanitySubscription(userSubscriptionSanityId, {
        isActive: true,
        status: 'active',
        endDate: endDate.toISOString(),
        nextBillingDate: endDate.toISOString()
      });
      
      // Update Supabase user subscription
      await updateSupabaseSubscription(session.id, {
        status: 'active',
        is_active: true,
        stripe_subscription_id: subscription.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        next_billing_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      }, 'stripe_session_id');
    } else {
      console.error(`No user subscription found for session ID: ${session.id}`);
      throw new Error(`No user subscription found for session ID: ${session.id}`);
    }
  } catch (error) {
    console.error("Error handling subscription purchase:", error);
    throw error;
  }
}

/**
 * Handle appointment purchase
 */
async function handleAppointmentPurchase(
  session: Stripe.Checkout.Session,
  appointmentId: string,
  fromSubscription: boolean,
  userSubscriptionId?: string,
  qualiphyExamId?: string,
  customerId?: string
): Promise<void> {
  console.log(`Processing appointment purchase for ${appointmentId}`);
  
  try {
    // Find the appointment in Supabase
    const appointmentData = await getSupabaseAppointment(session.id);
    
    if (!appointmentData) {
      throw new Error(`No appointment found for session ID: ${session.id}`);
    }
    
    const sanityAppointmentId = appointmentData.sanity_id;
    
    if (sanityAppointmentId) {
      // Schedule default date (tomorrow)
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);
      
      // Update Sanity user appointment
      await updateSanityAppointment(sanityAppointmentId, {
        status: 'scheduled',
        scheduledDate: scheduledDate.toISOString()
      });
      
      // Update Supabase user appointment
      await updateSupabaseAppointment(session.id, {
        status: 'scheduled',
        scheduled_date: scheduledDate.toISOString(),
        stripe_customer_id: customerId || null,
        updated_at: new Date().toISOString()
      }, 'stripe_session_id');

      // If this appointment is from a subscription, update the subscription usage
      if (fromSubscription && userSubscriptionId) {
        await updateSubscriptionAppointmentUsage(userSubscriptionId);
      }
      
      // Handle Qualiphy integration if applicable
      if (qualiphyExamId && parseInt(qualiphyExamId) > 0) {
        console.log(`Will handle Qualiphy exam ID: ${qualiphyExamId} when user accesses widget`);
        // Actual integration with Qualiphy would happen elsewhere
      }
    } else {
      throw new Error(`No sanity ID found for appointment with session ID: ${session.id}`);
    }
  } catch (error) {
    console.error("Error handling appointment purchase:", error);
    throw error;
  }
}

/**
 * Update subscription appointment usage
 */
async function updateSubscriptionAppointmentUsage(userSubscriptionId: string): Promise<void> {
  try {
    // Get current appointments used count from Supabase
    const subscriptionData = await getSupabaseSubscription(userSubscriptionId);
    
    if (!subscriptionData) {
      throw new Error(`Subscription not found: ${userSubscriptionId}`);
    }
    
    const appointmentsUsed = (subscriptionData.appointments_used || 0) + 1;
    const subscriptionSanityId = subscriptionData.sanity_id;
    
    // Update appointment usage in Supabase
    await updateSupabaseSubscription(userSubscriptionId, { 
      appointments_used: appointmentsUsed,
      updated_at: new Date().toISOString()
    });
    
    // Update appointment usage in Sanity if we have the Sanity ID
    if (subscriptionSanityId) {
      await updateSanitySubscription(subscriptionSanityId, { 
        appointmentsUsed: appointmentsUsed 
      });
    }
    
    console.log(`✅ Updated subscription appointment usage: ${appointmentsUsed}`);
  } catch (error) {
    console.error("Failed to update subscription appointment usage:", error);
    throw error;
  }
}

/**
 * Handle regular order purchase
 */
async function handleRegularOrderPurchase(
  session: Stripe.Checkout.Session,
  orderId?: string,
  sanityId?: string,
  customerId?: string
): Promise<void> {
  console.log(`Processing regular order for ID: ${orderId || sanityId}`);
  
  const now = new Date().toISOString();
  
  // Update Supabase order if we have a Supabase ID
  if (orderId) {
    await updateSupabaseOrder(orderId, {
      status: 'paid',
      payment_method: 'stripe',
      payment_status: 'paid',
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_customer_id: customerId || null,
      updated_at: now
    });
  }
  
  // Update Sanity order if we have a Sanity ID
  if (sanityId) {
    await updateSanityOrder(sanityId, {
      status: 'paid',
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent as string,
      stripeCustomerId: customerId
    });
  }
}