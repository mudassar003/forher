// src/app/api/admin/subscriptions/cancel/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/utils/adminAuthServer";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Check admin authorization
    const authResult = await isAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subscriptionId, cancelImmediately = false } = await req.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Get subscription from database
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No Stripe subscription found" },
        { status: 400 }
      );
    }

    // Cancel subscription in Stripe
    let canceledSubscription;
    
    if (cancelImmediately) {
      // Cancel immediately
      canceledSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
    } else {
      // Cancel at period end
      canceledSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true
        }
      );
    }

    // Update database
    const now = new Date().toISOString();
    const updateData = {
      status: cancelImmediately ? 'cancelled' : 'cancelling',
      is_active: cancelImmediately ? false : true,
      cancellation_date: now,
      updated_at: now
    };

    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update(updateData)
      .eq('id', subscriptionId);

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: cancelImmediately 
        ? "Subscription cancelled immediately" 
        : "Subscription will cancel at period end",
      subscription: {
        ...subscription,
        ...updateData,
        stripe_cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        stripe_canceled_at: canceledSubscription.canceled_at
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to cancel subscription"
      }, 
      { status: 500 }
    );
  }
}