// src/app/api/auth-test/subscription/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { getAuthenticatedUser } from '@/utils/apiAuth';
import { v4 as uuidv4 } from 'uuid'; // Import UUID generator

// Define the shape of the expected request body
interface SubscriptionTestData {
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
  // Get the authenticated user
  const user = await getAuthenticatedUser();
  
  // If not authenticated, return error
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    );
  }
  
  try {
    // Get request data
    const data: SubscriptionTestData = await req.json();
    
    // Verify the user ID matches the authenticated user
    if (data.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'User ID mismatch - cannot create data for another user' },
        { status: 403 }
      );
    }

    // Create a Supabase client with the current request cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Log the authenticated user for debugging
    console.log('Authenticated user:', user.id, user.email);
    
    // Add a test prefix to the subscription name to identify test entries
    const subscriptionName = `[TEST] ${data.subscriptionName}`;
    
    // Generate a UUID for the new subscription
    const subscriptionId = uuidv4();
    
    // Current timestamp for created_at and updated_at
    const now = new Date().toISOString();
    
    // Insert into user_subscriptions table
    const { data: newSubscription, error } = await supabase
      .from('user_subscriptions')
      .insert({
        id: subscriptionId, // Explicitly include the id field
        user_id: user.id,
        user_email: user.email || data.userEmail,
        subscription_name: subscriptionName,
        plan_id: data.planId,
        billing_amount: data.billingAmount,
        billing_period: data.billingPeriod,
        is_active: data.isActive,
        has_appointment_access: data.hasAppointmentAccess,
        appointment_discount_percentage: data.appointmentDiscountPercentage,
        start_date: now,
        created_at: now,
        updated_at: now,
        status: data.isActive ? 'active' : 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test subscription:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test subscription created successfully',
      subscription: newSubscription
    });

  } catch (error) {
    console.error('Unexpected error in auth test endpoint:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }, 
      { status: 500 }
    );
  }
}