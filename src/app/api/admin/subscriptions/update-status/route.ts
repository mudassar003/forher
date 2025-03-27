// src/app/api/admin/subscriptions/update-status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Define types
interface UpdateStatusRequest {
  subscriptionId: string;
  status: string;
  isActive: boolean;
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const data: UpdateStatusRequest = await req.json();
    
    // Validate required fields
    if (!data.subscriptionId) {
      return NextResponse.json(
        { success: false, error: "Subscription ID is required" },
        { status: 400 }
      );
    }
    
    if (!data.status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses = ['active', 'paused', 'cancelled', 'cancelling', 'pending', 'past_due', 'trialing', 'incomplete', 'expired'];
    if (!validStatuses.includes(data.status.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }
    
    // Fetch the current subscription to get Sanity ID
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('sanity_id')
      .eq('id', data.subscriptionId)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: `Subscription not found: ${fetchError.message}` },
        { status: 404 }
      );
    }
    
    const sanityId = subscription.sanity_id;
    
    // Prepare update data
    const now = new Date().toISOString();
    
    // Update Supabase
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        status: data.status,
        is_active: data.isActive,
        updated_at: now
      })
      .eq('id', data.subscriptionId);
    
    if (updateError) {
      return NextResponse.json(
        { success: false, error: `Failed to update Supabase: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Update Sanity if we have a Sanity ID
    if (sanityId) {
      try {
        await sanityClient
          .patch(sanityId)
          .set({
            status: data.status,
            isActive: data.isActive
          })
          .commit();
      } catch (sanityError) {
        console.error("Error updating Sanity:", sanityError);
        return NextResponse.json(
          { 
            success: false, 
            error: `Updated Supabase but failed to update Sanity: ${sanityError instanceof Error ? sanityError.message : 'Unknown error'}`
          }, 
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "Subscription status updated successfully",
      data: {
        id: data.subscriptionId,
        status: data.status,
        isActive: data.isActive,
        updatedAt: now,
        sanityUpdated: !!sanityId
      }
    });
    
  } catch (error) {
    console.error("Error updating subscription status:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update subscription status"
      }, 
      { status: 500 }
    );
  }
}