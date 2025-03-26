//src/app/api/stripe/subscriptions/cancel/route.ts
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
    
    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(data.subscriptionId, {
      cancel_at_period_end: true,
    });
    
    // Get end date for updating records
    const cancelDate = new Date(subscription.current_period_end * 1000).toISOString();
    
    // Find the user subscription in Supabase
    const { data: userSubscriptionData, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id, sanity_id')
      .eq('stripe_subscription_id', data.subscriptionId)
      .single();
    
    if (fetchError) {
      console.error("Error fetching subscription:", fetchError);
      throw new Error(`Subscription not found: ${fetchError.message}`);
    }

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