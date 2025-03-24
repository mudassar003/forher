// src/app/api/orders/by-session/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { retrieveCheckoutSession } from "@/lib/stripe";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "Session ID is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Looking up order for session ID: ${sessionId}`);

    // First, try to find the order in Supabase by session ID
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, sanity_id, stripe_session_id')
      .eq('stripe_session_id', sessionId)
      .single();

    if (orderData) {
      console.log(`✅ Found order in database: ${JSON.stringify(orderData)}`);
      return NextResponse.json({
        success: true,
        orderId: orderData.sanity_id || orderData.id,
        supabaseId: orderData.id,
        sanityId: orderData.sanity_id
      });
    }

    console.log(`⚠️ Order not found in database, checking Stripe session...`);

    // If no order is found, the webhook might not have processed yet
    // Verify the session with Stripe
    const session = await retrieveCheckoutSession(sessionId);
    
    console.log(`Stripe session status: ${session.payment_status}`);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: "Payment has not been completed for this session" },
        { status: 400 }
      );
    }

    // If session is paid but we don't have an order yet, the webhook might be delayed
    console.log(`💰 Payment confirmed, but order not yet created. Webhook might be delayed.`);
    
    return NextResponse.json({
      success: true,
      orderId: null,
      message: "Payment confirmed, but order details are still being processed. Please check your email for confirmation."
    });

  } catch (error: any) {
    console.error("Error retrieving order by session:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to retrieve order details" 
      }, 
      { status: 500 }
    );
  }
}