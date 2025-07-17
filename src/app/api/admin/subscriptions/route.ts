// src/app/api/admin/subscriptions/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAdminUser } from "@/utils/adminAuthServer";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    // Check admin authorization
    const authResult = await isAdminUser(req);
    if (!authResult.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    const offset = (page - 1) * limit;

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
        cancellation_date,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    // Add search filter
    if (search) {
      query = query.or(`user_email.ilike.%${search}%,plan_name.ilike.%${search}%`);
    }

    // Add status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Get total count for pagination
    const { count } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true });

    // Apply pagination
    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

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
      cancellation_date: sub.cancellation_date,
      created_at: sub.created_at,
      updated_at: sub.updated_at
    }));

    return NextResponse.json({
      success: true,
      subscriptions,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch subscriptions"
      }, 
      { status: 500 }
    );
  }
}