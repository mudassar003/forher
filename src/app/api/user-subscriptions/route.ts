// src/app/api/user-subscriptions/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

// Define the shape of the expected request body
interface SubscriptionData {
  userId: string;
  userEmail: string;
  subscriptionName: string;
  planId: string;
  billingAmount: number;
  billingPeriod: 'monthly' | 'quarterly' | 'annually';
  isActive: boolean;
  hasAppointmentAccess: boolean;
  appointmentDiscountPercentage: number;
}

export async function POST(req: Request) {
  // Log entire request for debugging
  console.log('Full Request Headers:', Object.fromEntries(req.headers));
  
  try {
    // Attempt to get the request body first
    const subscriptionData: SubscriptionData = await req.json();
    console.log('Received Subscription Data:', subscriptionData);

    // Multiple authentication methods
    const cookieStore = cookies();
    const supabaseRouteHandler = createRouteHandlerClient({ cookies: () => cookieStore });

    // Try getting user via route handler
    const { data: routeHandlerData, error: routeHandlerError } = 
      await supabaseRouteHandler.auth.getUser();
    
    // Try getting user via standard supabase client
    const { data: standardData, error: standardError } = 
      await supabase.auth.getUser();

    console.log('Route Handler User:', routeHandlerData);
    console.log('Standard Client User:', standardData);
    console.log('Route Handler Error:', routeHandlerError);
    console.log('Standard Client Error:', standardError);

    // Determine which authentication method worked
    const user = routeHandlerData?.user || standardData?.user;
    const authError = routeHandlerError || standardError;

    // Comprehensive authentication check
    if (authError || !user) {
      console.error('Authentication Failed:', {
        routeHandlerError: routeHandlerError?.message,
        standardError: standardError?.message
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required', 
          details: {
            routeHandlerError: routeHandlerError?.message,
            standardError: standardError?.message
          }
        }, 
        { status: 401 }
      );
    }

    // Validate input
    if (subscriptionData.userId !== user.id) {
      console.error('User ID Mismatch', {
        providedUserId: subscriptionData.userId,
        authenticatedUserId: user.id
      });

      return NextResponse.json(
        { success: false, error: 'Unauthorized: User ID mismatch' }, 
        { status: 403 }
      );
    }

    // Prepare data for Supabase insertion
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        user_email: user.email || subscriptionData.userEmail,
        subscription_name: subscriptionData.subscriptionName,
        plan_id: subscriptionData.planId,
        billing_amount: subscriptionData.billingAmount,
        billing_period: subscriptionData.billingPeriod,
        is_active: subscriptionData.isActive,
        has_appointment_access: subscriptionData.hasAppointmentAccess,
        appointment_discount_percentage: subscriptionData.appointmentDiscountPercentage,
        start_date: new Date().toISOString(),
        status: subscriptionData.isActive ? 'active' : 'pending'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase Insertion Error:', error);
      return NextResponse.json(
        { success: false, error: error.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptionId: data.id
    });

  } catch (error) {
    console.error('Unexpected Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        fullError: error
      }, 
      { status: 500 }
    );
  }
}

// Enable CORS for the route
export const config = {
  api: {
    bodyParser: true,
  },
};