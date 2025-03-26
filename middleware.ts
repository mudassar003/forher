// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { appointmentAccessMiddleware } from './src//middleware/appointmentAccess';

export async function middleware(request: NextRequest) {
  // Create a response that we'll use to pass along
  const res = NextResponse.next();
  
  // Create a Supabase client for auth
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if needed
  await supabase.auth.getSession();
  
  // Get the pathname
  const path = request.nextUrl.pathname;
  
  // Handle appointment access restrictions
  if (path.startsWith('/appointment') || path.startsWith('/appointments')) {
    return appointmentAccessMiddleware(request);
  }
  
  // For auth protected routes that aren't appointment specific
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
    '/appointment/:path*',
    '/appointments/:path*'
  ],
};