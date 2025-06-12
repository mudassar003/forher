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
  subscriptionId: string; // The Supabase subscription ID
  immediate?: boolean; // Whether to cancel immediately or at period end
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

    // Set immediate cancellation as default
    const isImmediateCancel = data.immediate !== false;
    
    console.log(`${isImmediateCancel ? 'Immediately cancelling' : 'Scheduling cancellation for'} subscription: ${data.subscriptionId}`);
    
    // First, try to find the subscription in our database using the subscriptionId
    // Check if it's a Supabase ID (UUID format) or Stripe ID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.subscriptionId);
    
    let userSubscriptionData;
    let stripeSubscriptionId;
    
    if (isUuid) {
      // It's a Supabase UUID, fetch by ID
      const { data: subData, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('id, stripe_subscription_id, sanity_id, status')
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
        .select('id, stripe_subscription_id, sanity_id, status')
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

    // Check if already cancelled
    if (userSubscriptionData.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        message: "Subscription is already cancelled"
      });
    }

    // Cancel subscription in Stripe
    let subscription;
    let targetStatus = 'cancelled';
    let isActive = false;
    let endDate = new Date().toISOString();

    if (stripeSubscriptionId) {
      try {
        if (isImmediateCancel) {
          // Cancel immediately - subscription ends now
          subscription = await stripe.subscriptions.cancel(stripeSubscriptionId);
          console.log('✅ Cancelled subscription immediately in Stripe');
        } else {
          // Cancel at period end - subscription remains active until period ends
          subscription = await stripe.subscriptions.update(stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          targetStatus = 'cancelling';
          isActive = true; // Keep active until period ends
          endDate = new Date(subscription.current_period_end * 1000).toISOString();
          console.log('✅ Scheduled subscription cancellation in Stripe');
        }
      } catch (stripeError) {
        console.error("Stripe error:", stripeError);
        
        // If subscription doesn't exist in Stripe, proceed with local cancellation
        if (stripeError instanceof Stripe.errors.StripeError && stripeError.code === 'resource_missing') {
          console.log("Subscription not found in Stripe, proceeding with local cancellation");
          subscription = null;
        } else {
          throw new Error(`Stripe error: ${stripeError instanceof Error ? stripeError.message : 'Unknown error'}`);
        }
      }
    }
    
    // Update Supabase subscription status
    const now = new Date().toISOString();
    const updateData: any = {
      status: targetStatus,
      is_active: isActive,
      cancellation_date: now,
      updated_at: now
    };

    // Set end_date only for immediate cancellation
    if (isImmediateCancel) {
      updateData.end_date = endDate;
    } else if (subscription?.current_period_end) {
      updateData.end_date = endDate;
    }

    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', userSubscriptionData.id);
    
    if (updateError) {
      console.error("Error updating subscription in Supabase:", updateError);
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }
    
    console.log(`✅ Updated Supabase subscription status to: ${targetStatus}`);
    
    // If we have a Sanity ID, update Sanity too
    if (userSubscriptionData.sanity_id) {
      try {
        await sanityClient
          .patch(userSubscriptionData.sanity_id)
          .set({
            status: targetStatus,
            isActive: isActive,
            cancellationDate: now,
            ...(isImmediateCancel && { endDate })
          })
          .commit();
        
        console.log(`✅ Updated Sanity subscription status to: ${targetStatus}`);
      } catch (error) {
        console.error("Error updating subscription in Sanity:", error);
        // Don't throw here, Supabase is our source of truth
      }
    }
    
    const message = isImmediateCancel 
      ? "Subscription has been cancelled immediately"
      : "Subscription will be cancelled at the end of your billing period";
    
    return NextResponse.json({
      success: true,
      message,
      status: targetStatus,
      cancelled_immediately: isImmediateCancel
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