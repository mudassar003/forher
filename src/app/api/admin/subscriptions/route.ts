// src/app/api/admin/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    
    // Build query
    let query = supabaseAdmin
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        user_email,
        plan_name,
        subscription_name,
        sanity_id,
        sanity_subscription_id,
        billing_amount,
        billing_period,
        start_date,
        end_date,
        next_billing_date,
        status,
        is_active,
        stripe_subscription_id,
        stripe_customer_id,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });
    
    // Add filters if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error("Supabase query error:", error);
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }
    
    // Process the data to format for frontend
    const subscriptions = (data || []).map(sub => ({
      id: sub.id,
      user_id: sub.user_id,
      user_email: sub.user_email,
      plan_name: sub.plan_name || sub.subscription_name || 'Unknown Plan',
      status: sub.status,
      is_active: sub.is_active,
      sanity_id: sub.sanity_id,
      sanity_subscription_id: sub.sanity_subscription_id,
      stripe_subscription_id: sub.stripe_subscription_id,
      stripe_customer_id: sub.stripe_customer_id,
      start_date: sub.start_date,
      end_date: sub.end_date,
      next_billing_date: sub.next_billing_date || sub.end_date,
      billing_amount: sub.billing_amount,
      billing_period: sub.billing_period,
      created_at: sub.created_at,
      updated_at: sub.updated_at
    }));
    
    return NextResponse.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch subscriptions"
      }, 
      { status: 500 }
    );
  }
}