// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Define protected routes
const PROTECTED_ROUTES = [
  '/account',
  '/account/profile',
  '/account/orders',
  '/account/subscriptions',
  '/account/settings',
  '/checkout',
  '/appointment'
];

// Define auth-related routes
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];

// Helper to check if a path matches any of the patterns
const matchesPatterns = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      // Handle wildcard patterns like '/account/*'
      const base = pattern.slice(0, -1);
      return path.startsWith(base);
    }
    return path === pattern;
  });
};

export async function middleware(req: NextRequest) {
  // Create a response that we'll modify and return
  const res = NextResponse.next();
  
  // Add security headers to all responses
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Create a Supabase client for auth with cookie support
  const supabase = createMiddlewareClient({ req, res });

  // Get the pathname
  const path = req.nextUrl.pathname;
  
  // For protection against brute force login attempts - implement rate limiting
  // This is a simple version - real implementation should use Redis or similar
  if (path === '/login' && req.method === 'POST') {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitKey = `ratelimit_login_${ip}`;
    
    // This is just pseudocode, real implementation would store in Redis
    // const attempts = await redis.get(rateLimitKey) || 0;
    // if (attempts > 5) {
    //   res.headers.set('Retry-After', '1800'); // 30 minutes
    //   return NextResponse.json(
    //     { error: 'Too many login attempts. Please try again later.' },
    //     { status: 429 }
    //   );
    // }
    // await redis.setex(rateLimitKey, 1800, attempts + 1);
  }
  
  // Get the current session from cookies
  const { data: { session } } = await supabase.auth.getSession();
  
  // For auth protected routes
  if (matchesPatterns(path, PROTECTED_ROUTES)) {    
    // If no session, redirect to login
    if (!session) {
      const returnUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
    }
    
    // Optional: Check for specific roles for specific routes
    if (path.startsWith('/admin')) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
        
      if (!userRole || userRole.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }
  
  // Prevent logged-in users from accessing auth pages
  if (matchesPatterns(path, AUTH_ROUTES)) {
    // If user is already logged in, redirect to dashboard
    if (session) {
      // Check if there's a returnUrl in the query
      const url = new URL(req.url);
      const returnUrl = url.searchParams.get('returnUrl');
      
      // Redirect to returnUrl if it exists and is a relative URL 
      // (to prevent open redirect vulnerabilities)
      if (returnUrl && !returnUrl.startsWith('http')) {
        // Validate the returnUrl to ensure it's safe
        const isValidReturnUrl = !returnUrl.includes('//') && !returnUrl.startsWith('/api/');
        if (isValidReturnUrl) {
          return NextResponse.redirect(new URL(returnUrl, req.url));
        }
      }
      
      // Default redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  // Handle password reset with valid token
  if (path === '/reset-password') {
    // Ensure the request has a valid token parameter
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      // Redirect to login if no token is provided
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Note: Token validation will be handled by the reset password page
  }
  
  return res;
}

// Define which routes should be processed by the middleware
export const config = {
  matcher: [
    // Protected routes
    '/account/:path*',
    '/checkout/:path*',
    '/appointment/:path*',
    
    // Auth routes
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    
    // API routes that need auth checks
    '/api/user-subscriptions/:path*',
    '/api/orders/:path*',
    '/api/stripe/subscriptions/:path*',
    
    // Add more routes as needed
  ],
};