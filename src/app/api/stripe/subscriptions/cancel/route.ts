// src/app/api/stripe/subscriptions/cancel/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";
import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: undefined, // Use latest API version
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface CancelSubscriptionRequest {
  subscriptionId: string; // The Stripe subscription ID
}

export async function POST(req: Request) {
  try {
    // Extract and validate request body
    const data: CancelSubscriptionRequest = await req.json();
    
    if (!data.subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    console.log(`Cancelling subscription: ${data.subscriptionId}`);
    
    // First, try to find the subscription in our database using the subscriptionId
    // Check if it's a Supabase ID (UUID format) or Stripe ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.subscriptionId);
    
    let userSubscriptionData;
    let stripeSubscriptionId;
    
    if (isUuid) {
      // It's a Supabase UUID, fetch by ID
      const { data: subData, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, stripe_subscription_id, sanity_id')
        .eq('id', data.subscriptionId)
        .single();
      
      if (fetchError || !subData) {
        return NextResponse.json(
          { success: false, error: "Subscription not found" },
          { status: 404 }
        );
      }
      
      userSubscriptionData = subData;
      stripeSubscriptionId = subData.stripe_subscription_id;
    } else {
      // It's a Stripe ID, fetch by Stripe subscription ID
      const { data: subData, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, stripe_subscription_id, sanity_id')
        .eq('stripe_subscription_id', data.subscriptionId)
        .single();
      
      if (fetchError || !subData) {
        return NextResponse.json(
          { success: false, error: "Subscription not found" },
          { status: 404 }
        );
      }
      
      userSubscriptionData = subData;
      stripeSubscriptionId = data.subscriptionId;
    }

    // If no Stripe subscription ID, update locally only
    if (!stripeSubscriptionId) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          is_active: false,
          cancellation_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userSubscriptionData.id);
      
      if (updateError) {
        throw new Error(`Failed to update subscription: ${updateError.message}`);
      }
      
      return NextResponse.json({
        success: true,
        message: "Subscription cancelled successfully (no Stripe subscription found)"
      });
    }

    // Cancel subscription in Stripe
    let subscription;
    try {
      subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      // If subscription doesn't exist in Stripe, proceed with local cancellation
      if (stripeError instanceof Stripe.errors.StripeError && stripeError.code === 'resource_missing') {
        console.log("Subscription not found in Stripe, proceeding with local cancellation");
      } else {
        throw new Error(`Stripe error: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`);
      }
    }
    
    // Get end date for updating records
    const cancelDate = subscription 
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : new Date().toISOString();
    
    // Update Supabase subscription status
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelling',
        is_active: true, // Keep active until the end of the period
        cancellation_date: new Date().toISOString(),
        end_date: cancelDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', userSubscriptionData.id);
    
    if (updateError) {
      console.error("Error updating subscription in Supabase:", updateError);
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }
    
    // If we have a Sanity ID, update Sanity too
    if (userSubscriptionData.sanity_id) {
      try {
        await sanityClient
          .patch(userSubscriptionData.sanity_id)
          .set({
            status: 'cancelling',
            isActive: true,
            cancellationDate: new Date().toISOString(),
            endDate: cancelDate
          })
          .commit();
      } catch (error) {
        console.error("Error updating subscription in Sanity:", error);
        // Don't throw here, Supabase is our source of truth
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Subscription cancelled successfully. You'll maintain access until the end of your billing period."
    });
    
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to cancel subscription"
      }, 
      { status: 500 }
    );
  }
}