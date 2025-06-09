// src/app/api/appointment-access/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase environment variables are not defined');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Response interface for appointment access
interface AppointmentAccessResponse {
  success: boolean;
  hasAccess: boolean;
  isFirstTime: boolean;
  timeRemaining: number; // in seconds
  accessExpired: boolean;
  subscriptionId?: string;
  message?: string;
  error?: string;
}

// Interface for subscription data
interface SubscriptionData {
  id: string;
  user_id: string;
  has_appointment_access: boolean;
  appointment_accessed_at: string | null;
  appointment_access_expired: boolean;
  appointment_access_duration: number;
  is_active: boolean;
  status: string;
  plan_name: string;
}

/**
 * POST: Core business logic - Check and record appointment access
 * This protects the expensive 3rd party widget from unauthorized access
 */
export async function POST(req: NextRequest): Promise<NextResponse<AppointmentAccessResponse>> {
  try {
    // Get authentication from cookies (Vercel compatible)
    const authHeader = req.headers.get('authorization');
    const cookies = req.headers.get('cookie');
    
    if (!cookies) {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Extract user ID from request body as fallback
    let userId: string;
    try {
      const body = await req.json();
      userId = body.userId;
    } catch {
      // If no body, try to get from Supabase auth
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({
          success: false,
          hasAccess: false,
          isFirstTime: false,
          timeRemaining: 0,
          accessExpired: false,
          error: 'User authentication failed'
        }, { status: 401 });
      }
      userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    console.log(`🔒 Checking appointment access for user: ${userId}`);

    // CORE BUSINESS LOGIC: Single query to get user's appointment access status
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        id,
        user_id,
        has_appointment_access,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration,
        is_active,
        status,
        plan_name
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      // REMOVED: .eq('has_appointment_access', true) - ALL active subscriptions get appointment access
      .in('status', ['active', 'trialing', 'cancelling', 'past_due'])
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Initialize subscription variable that we can reassign
    let subscription: SubscriptionData | null = subscriptionData;

    // If main query fails, try a more liberal approach
    if (subError || !subscription) {
      console.log(`⚠️ Main query failed, trying liberal query...`);
      
      // Liberal query - just get any subscription for this user that looks active
      const { data: liberalSub, error: liberalError } = await supabaseAdmin
        .from('user_subscriptions')
        .select(`
          id,
          user_id,
          appointment_accessed_at,
          appointment_access_expired,
          appointment_access_duration,
          is_active,
          status,
          plan_name
        `)
        .eq('user_id', userId)
        .eq('status', 'active') // Just active status
        .order('created_at', { ascending: false })
        .limit(1);

      console.log(`📋 Liberal query result:`, liberalSub);
      console.log(`📋 Liberal query error:`, liberalError);

      if (liberalError || !liberalSub || liberalSub.length === 0) {
        console.log(`❌ No valid subscription found for user: ${userId}`);
        return NextResponse.json({
          success: false,
          hasAccess: false,
          isFirstTime: false,
          timeRemaining: 0,
          accessExpired: false,
          error: `No valid active subscription found. Debug: Main error: ${subError?.message}, Liberal error: ${liberalError?.message}`
        }, { status: 403 });
      }

      // ✅ FIXED: Use proper assignment instead of const reassignment
      subscription = liberalSub[0] as SubscriptionData;
      console.log(`✅ Using liberal query result: ${subscription.id}`);
    }

    // Ensure we have a subscription at this point
    if (!subscription) {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: 'No subscription found'
      }, { status: 403 });
    }

    console.log(`✅ Found active subscription: ${subscription.id} for plan: ${subscription.plan_name}`);

    // Check if access has already been marked as expired
    if (subscription.appointment_access_expired) {
      console.log(`⏰ Access already expired for subscription: ${subscription.id}`);
      return NextResponse.json({
        success: true,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: true,
        subscriptionId: subscription.id,
        message: 'Your appointment access has expired. Please contact support.'
      });
    }

    // FIRST TIME ACCESS - Record the access time
    if (!subscription.appointment_accessed_at) {
      console.log(`🎯 First time access - recording access time for subscription: ${subscription.id}`);
      
      // Use timestamp without timezone to match schema
      const now = new Date().toISOString().replace('Z', ''); // Remove Z for timestamp without time zone
      const updatedAt = new Date().toISOString(); // Keep Z for timestamp with time zone
      
      const { error: updateError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          appointment_accessed_at: now,
          updated_at: updatedAt
        })
        .eq('id', subscription.id)
        .is('appointment_accessed_at', null); // Correct way to check for null in Supabase

      if (updateError) {
        console.error(`❌ Failed to record access time: ${updateError.message}`);
        return NextResponse.json({
          success: false,
          hasAccess: false,
          isFirstTime: false,
          timeRemaining: 0,
          accessExpired: false,
          error: `Failed to record access time: ${updateError.message}`
        }, { status: 500 });
      }

      const accessDuration = subscription.appointment_access_duration || 600; // 10 minutes default from schema
      console.log(`✅ First access recorded. User has ${accessDuration} seconds (${accessDuration/60} minutes)`);
      
      return NextResponse.json({
        success: true,
        hasAccess: true,
        isFirstTime: true,
        timeRemaining: accessDuration,
        accessExpired: false,
        subscriptionId: subscription.id,
        message: `Welcome! You have ${accessDuration/60} minutes to complete your appointment.`
      });
    }

    // RETURNING ACCESS - Check if time has expired
    const accessedAt = new Date(subscription.appointment_accessed_at);
    const now = new Date();
    const durationMs = (subscription.appointment_access_duration || 600) * 1000; // Convert to milliseconds, use 600 as default from schema
    const elapsedMs = now.getTime() - accessedAt.getTime();
    const remainingMs = durationMs - elapsedMs;

    console.log(`⏱️ Time check - Elapsed: ${Math.floor(elapsedMs/1000)}s, Remaining: ${Math.floor(remainingMs/1000)}s`);

    if (remainingMs <= 0) {
      // TIME EXPIRED - Mark as expired and deny access
      console.log(`🚫 Time expired for subscription: ${subscription.id}`);
      
      const { error: expireError } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          appointment_access_expired: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id);

      if (expireError) {
        console.error(`⚠️ Failed to mark as expired: ${expireError.message}`);
      }

      return NextResponse.json({
        success: true,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: true,
        subscriptionId: subscription.id,
        message: 'Your appointment access time has expired. Please contact support for assistance.'
      });
    }

    // STILL WITHIN TIME LIMIT - Allow continued access
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    console.log(`✅ Access granted - ${remainingSeconds} seconds remaining`);
    
    return NextResponse.json({
      success: true,
      hasAccess: true,
      isFirstTime: false,
      timeRemaining: remainingSeconds,
      accessExpired: false,
      subscriptionId: subscription.id,
      message: `You have ${Math.ceil(remainingSeconds/60)} minutes remaining.`
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 Appointment access error:', error);
    
    return NextResponse.json({
      success: false,
      hasAccess: false,
      isFirstTime: false,
      timeRemaining: 0,
      accessExpired: false,
      error: `Access verification failed: ${errorMessage}`
    }, { status: 500 });
  }
}

/**
 * GET: Check current access status without modifying anything
 * Used for status checks and countdown updates
 */
export async function GET(req: NextRequest): Promise<NextResponse<AppointmentAccessResponse>> {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: 'User ID required'
      }, { status: 400 });
    }

    // Get current subscription status without modifying
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        id,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration,
        is_active,
        status
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .in('status', ['active', 'trialing', 'cancelling', 'past_due'])
      .single();

    if (subError || !subscription) {
      return NextResponse.json({
        success: false,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: false,
        error: 'No valid subscription'
      });
    }

    if (subscription.appointment_access_expired) {
      return NextResponse.json({
        success: true,
        hasAccess: false,
        isFirstTime: false,
        timeRemaining: 0,
        accessExpired: true,
        subscriptionId: subscription.id
      });
    }

    if (!subscription.appointment_accessed_at) {
      return NextResponse.json({
        success: true,
        hasAccess: true,
        isFirstTime: true,
        timeRemaining: subscription.appointment_access_duration || 600,
        accessExpired: false,
        subscriptionId: subscription.id
      });
    }

    // Calculate remaining time
    const accessedAt = new Date(subscription.appointment_accessed_at);
    const now = new Date();
    const durationMs = (subscription.appointment_access_duration || 600) * 1000;
    const elapsedMs = now.getTime() - accessedAt.getTime();
    const remainingMs = durationMs - elapsedMs;

    return NextResponse.json({
      success: true,
      hasAccess: remainingMs > 0,
      isFirstTime: false,
      timeRemaining: Math.max(0, Math.ceil(remainingMs / 1000)),
      accessExpired: remainingMs <= 0,
      subscriptionId: subscription.id
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('GET appointment access error:', error);
    
    return NextResponse.json({
      success: false,
      hasAccess: false,
      isFirstTime: false,
      timeRemaining: 0,
      accessExpired: false,
      error: errorMessage
    }, { status: 500 });
  }
}