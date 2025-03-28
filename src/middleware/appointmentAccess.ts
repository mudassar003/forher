// src/middleware/appointmentAccess.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

// This middleware checks if the user can access appointment pages
export async function appointmentAccessMiddleware(request: NextRequest) {
  // Create a Supabase client for auth
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();

  // If user is not authenticated, redirect to login
  if (!session) {
    // Store the URL they were trying to access
    const returnUrl = encodeURIComponent(request.nextUrl.pathname);
    return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
  }

  // User is authenticated, now check if they have appointment access
  const userId = session.user.id;

  // Check for active appointments with paid status and N/A exam status
  // ONLY N/A status is valid for appointment access
  const { data: appointmentData, error: appointmentError } = await supabase
    .from('user_appointments')
    .select('id')
    .eq('user_id', userId)
    .eq('is_deleted', false) // Only consider non-deleted appointments
    .eq('payment_status', 'paid') // Must be paid
    .or('status.eq.scheduled,status.eq.confirmed,status.eq.pending')
    .eq('qualiphy_exam_status', 'N/A') // ONLY N/A status allows access
    .limit(1);

  if (appointmentData && appointmentData.length > 0) {
    // User has a valid appointment, allow access
    return NextResponse.next();
  }

  // Check for active subscriptions with appointment access
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('has_appointment_access', true)
    .eq('is_deleted', false) // Only consider non-deleted subscriptions
    .or('status.eq.active,status.eq.trialing,status.eq.cancelling')
    .limit(1);

  if (subscriptionData && subscriptionData.length > 0) {
    // User has an active subscription with appointment access, allow access
    return NextResponse.next();
  }

  // No active appointment or subscription with appointment access, redirect to subscription page
  return NextResponse.redirect(new URL('/account/subscriptions?access=denied', request.url));
}