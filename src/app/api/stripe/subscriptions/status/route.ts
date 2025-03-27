// src/app/api/stripe/subscriptions/status/route.ts
// This endpoint allows for manual fixing of subscription statuses
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SubscriptionStatusRequest {
  userId: string;
  sessionId?: string;
  subscriptionId?: string;
}

export async function POST(req: Request) {
  try {
    const data: SubscriptionStatusRequest = await req.json();
    
    if (!data.userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', data.userId);
    
    // Add additional filtering if provided
    if (data.sessionId) {
      query = query.eq('stripe_session_id', data.sessionId);
    }
    
    if (data.subscriptionId) {
      query = query.eq('stripe_subscription_id', data.subscriptionId);
    }
    
    // Find all matching subscriptions
    const { data: subscriptions, error } = await query;
    
    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json(
        { success: false, error: "Error fetching subscription data" },
        { status: 500 }
      );
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching subscriptions found" },
        { status: 404 }
      );
    }
    
    // Process each subscription to ensure consistency
    const results = await Promise.all(subscriptions.map(async (subscription) => {
      // Skip if already active and consistent
      if (subscription.status === 'active' && subscription.is_active === true) {
        return {
          id: subscription.id,
          status: subscription.status,
          message: "Already active"
        };
      }
      
      try {
        // Update in Supabase
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'active',
            is_active: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', subscription.id);
        
        if (updateError) {
          throw new Error(`Failed to update in Supabase: ${updateError.message}`);
        }
        
        // Update in Sanity if we have the ID
        if (subscription.sanity_id) {
          await sanityClient
            .patch(subscription.sanity_id)
            .set({
              status: 'active',
              isActive: true
            })
            .commit();
        }
        
        return {
          id: subscription.id,
          status: 'active',
          message: "Status updated to active"
        };
      } catch (error) {
        console.error(`Error updating subscription ${subscription.id}:`, error);
        return {
          id: subscription.id,
          status: subscription.status,
          error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }));
    
    return NextResponse.json({
      success: true,
      results
    });
    
  } catch (error) {
    console.error("Error processing subscription status update:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    );
  }
}