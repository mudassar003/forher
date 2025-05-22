// src/app/api/stripe/webhook/handlers/checkout.ts
import { NextResponse } from "next/server";
import { Stripe } from "stripe";
import stripe from "../utils/stripe-client";
import { supabase, sanityClient } from "../utils/db-clients";
import { 
  WebhookResponse, 
  CheckoutSessionMetadata,
  SanitySubscriptionUpdateData 
} from "../utils/types";
import {
  getSupabaseSubscription,
  updateSupabaseSubscription,
  updateSanitySubscription,
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
    // Extract metadata with proper typing
    const metadata = session.metadata as CheckoutSessionMetadata;
    const userId = metadata?.userId;
    const userEmail = metadata?.userEmail;
    const subscriptionId = metadata?.subscriptionId;
    const orderId = metadata?.orderId;
    const sanityId = metadata?.sanityId;
    const variantKey = metadata?.variantKey;
    const subscriptionType = metadata?.subscriptionType;

    // Get customer information if available
    let customerId = session.customer as string;
    if (!customerId && session.customer_details?.email) {
      customerId = await getOrCreateCustomer(session.customer_details);
    }
    
    // Check what type of purchase this is
    const isSubscription = session.mode === 'subscription' || subscriptionType === 'subscription';
    const isRegularOrder = orderId || sanityId;
    
    // Handle different purchase types
    if (isSubscription && subscriptionId) {
      await handleSubscriptionPurchase(session, subscriptionId, userId, variantKey);
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
    
    // Try to find an existing customer
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
 * Handle subscription purchase and retrieve variant information if necessary
 */
async function handleSubscriptionPurchase(
  session: Stripe.Checkout.Session,
  subscriptionId: string,
  userId?: string,
  variantKey?: string
): Promise<void> {
  console.log(`Processing subscription purchase for ${subscriptionId}${variantKey ? ` with variant ${variantKey}` : ''}`);
  
  // Get Stripe subscription ID from the session
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );
  
  // Get session metadata
  const metadata = session.metadata || {};
  
  // Update Sanity user subscription
  try {
    const { data: sanityUserSub, error } = await supabase
      .from('user_subscriptions')
      .select('sanity_id, id, variant_key')
      .eq('stripe_session_id', session.id)
      .single();
    
    if (error) {
      console.error("Error fetching user subscription:", error);
      throw error;
    }
    
    const userSubscriptionSanityId = sanityUserSub?.sanity_id;
    const supabaseSubscriptionId = sanityUserSub?.id;
    const storedVariantKey = sanityUserSub?.variant_key || metadata.variantKey;

    if (userSubscriptionSanityId) {
      // Calculate end date based on billing period
      const startDate = new Date();
      let endDate = new Date(startDate);
      
      // Default to next month, but this will be overridden by actual subscription end date
      endDate.setMonth(endDate.getMonth() + 1);
      
      if (subscription.current_period_end) {
        endDate = new Date(subscription.current_period_end * 1000);
      }
      
      // Create the Sanity update data with the correct type
      const sanityUpdateData: SanitySubscriptionUpdateData = {
        isActive: true,
        status: 'active',
        endDate: endDate.toISOString(),
        nextBillingDate: endDate.toISOString(),
        stripeSubscriptionId: subscription.id
      };
      
      // Update Sanity user subscription
      await updateSanitySubscription(userSubscriptionSanityId, sanityUpdateData);
      
      console.log(`✅ Activated subscription in Sanity with ID: ${userSubscriptionSanityId}`);
      
      // Update Supabase user subscription with variant information
      const supabaseUpdateData = {
        status: 'active',
        is_active: true,
        stripe_subscription_id: subscription.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        next_billing_date: endDate.toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Ensure variant key is preserved if it exists
      if (storedVariantKey || variantKey) {
        // Add variant_key to the update if it's not already there
        Object.assign(supabaseUpdateData, {
          variant_key: storedVariantKey || variantKey
        });
      }
      
      await updateSupabaseSubscription(supabaseSubscriptionId, supabaseUpdateData);

      console.log(`✅ Activated subscription in Supabase with ID: ${supabaseSubscriptionId}${storedVariantKey ? ` (variant: ${storedVariantKey})` : ''}`);
    } else {
      console.error(`No user subscription found for session ID: ${session.id}`);
      
      // If we have a userId, try to find the subscription by user ID
      if (userId) {
        console.log(`Attempting to find subscription for user ID: ${userId}`);
        
        // Find the most recent subscription for this user
        const { data: userSubscriptions, error: userSubError } = await supabase
          .from('user_subscriptions')
          .select('id, sanity_id, status, is_active, variant_key')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (userSubError || !userSubscriptions?.length) {
          console.error("Failed to find subscription by user ID:", userSubError || "No subscriptions found");
        } else {
          const userSub = userSubscriptions[0];
          
          // Update this subscription to be active if it's not already
          if (userSub.status !== 'active' || !userSub.is_active) {
            const fallbackUpdateData = {
              status: 'active',
              is_active: true,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString()
            };
            
            // Preserve variant key if it exists
            if (userSub.variant_key || variantKey) {
              Object.assign(fallbackUpdateData, {
                variant_key: userSub.variant_key || variantKey
              });
            }
            
            await updateSupabaseSubscription(userSub.id, fallbackUpdateData);
            
            console.log(`✅ Activated fallback subscription in Supabase with ID: ${userSub.id}${userSub.variant_key ? ` (variant: ${userSub.variant_key})` : ''}`);
            
            // Update Sanity if we have a Sanity ID
            if (userSub.sanity_id) {
              await updateSanitySubscription(userSub.sanity_id, {
                status: 'active',
                isActive: true,
                stripeSubscriptionId: subscription.id
              });
              
              console.log(`✅ Activated fallback subscription in Sanity with ID: ${userSub.sanity_id}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error handling subscription purchase:", error);
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