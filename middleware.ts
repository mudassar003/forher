// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  // Create a response that we'll use to pass along
  const res = NextResponse.next();
  
  // Create a Supabase client for auth
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Handle appointment access restrictions - only check for auth and subscription
  if (path.startsWith('/appointment')) {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, redirect to login
    if (!session) {
      const returnUrl = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }

    // User is authenticated, now check if they have an active subscription
    const userId = session.user.id;

    // Check for active subscriptions
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .eq('is_deleted', false) // Only consider non-deleted subscriptions
      .or('status.eq.active,status.eq.trialing,status.eq.cancelling')
      .limit(1);

    if (subscriptionData && subscriptionData.length > 0) {
      // User has an active subscription with appointment access, allow access
      return NextResponse.next();
    }

    // No active subscription, redirect to subscription page
    return NextResponse.redirect(new URL('/subscriptions?access=denied', request.url));
  }
  
  // For auth protected routes
  if (path.startsWith('/account')) {
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    // If no session, redirect to login
    if (!session) {
      const returnUrl = encodeURIComponent(path);
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, request.url));
    }
  }
  
  return res;
}

// Define which routes should be processed by the middleware
export const config = {
  matcher: [
    '/account/:path*',
    '/appointment/:path*'
  ],
};