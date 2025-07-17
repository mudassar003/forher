// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_REQUESTS_PER_WINDOW = 100; // Max requests per window
const AUTH_MAX_REQUESTS = 20; // Stricter limit for auth endpoints

// Simple in-memory store for rate limiting (use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries
const cleanupExpiredEntries = () => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now > value.resetTime) {
      rateLimit.delete(key);
    }
  }
};

// Check rate limit
const checkRateLimit = (ip: string, isAuthRequest: boolean = false): { allowed: boolean; remaining: number; resetTime: number } => {
  cleanupExpiredEntries();
  
  const maxRequests = isAuthRequest ? AUTH_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;
  const now = Date.now();
  const record = rateLimit.get(ip);
  
  if (!record) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  if (now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + RATE_LIMIT_WINDOW };
  }
  
  record.count++;
  const remaining = Math.max(0, maxRequests - record.count);
  
  return {
    allowed: record.count <= maxRequests,
    remaining,
    resetTime: record.resetTime
  };
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>"'&]/g, '');
};

// Enhanced security headers
const setSecurityHeaders = (res: NextResponse) => {
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Enhanced CSP header
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://js.stripe.com https://widget.qualiphy.com https://cdn.sanity.io https://www.recaptcha.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://cdnjs.cloudflare.com https://api.qualiphy.com https://cdn.sanity.io wss://*.supabase.co https://*.supabase.co https://www.google.com https://www.recaptcha.net",
    "frame-src 'self' https://js.stripe.com https://widget.qualiphy.com https://www.google.com https://www.recaptcha.net",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  res.headers.set('Content-Security-Policy', cspHeader);
};

// Define supported languages
const supportedLanguages = ['en', 'es'];
const defaultLanguage = 'en';

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

// Define admin routes
const ADMIN_ROUTES = [
  '/admin',
  '/admin/subscriptions',
  '/admin/users',
  '/admin/dashboard'
];

// Define auth-related routes
const AUTH_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password'
];

// Routes that should bypass regular auth checks (like Stripe return URLs)
const BYPASS_ROUTES = [
  '/appointment?subscription_success=true',
  '/checkout/order-confirmation'
];

// Helper to check if a path matches any of the patterns
const matchesPatterns = (path: string, patterns: string[]): boolean => {
  return patterns.some(pattern => {
    if (pattern.endsWith('*')) {
      // Handle wildcard patterns like '/account/*'
      const base = pattern.slice(0, -1);
      return path.startsWith(base);
    }
    
    // For patterns with query parameters
    if (pattern.includes('?')) {
      const [patternPath, patternQuery] = pattern.split('?');
      if (path.startsWith(patternPath) && path.includes(patternQuery)) {
        return true;
      }
    }
    
    return path === pattern;
  });
};

// Check if the current URL should bypass auth checks
const shouldBypassAuth = (url: URL): boolean => {
  const fullPath = url.pathname + url.search;
  return matchesPatterns(fullPath, BYPASS_ROUTES);
};

// Get the preferred language from request
const getPreferredLanguage = (request: NextRequest): string => {
  // Check for language in the cookie
  const langCookie = request.cookies.get('i18nextLng')?.value;
  if (langCookie && supportedLanguages.includes(langCookie)) {
    return langCookie;
  }
  
  // Check for language in the Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language') || '';
  const headerLangs = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().substring(0, 2));
  
  for (const lang of headerLangs) {
    if (supportedLanguages.includes(lang)) {
      return lang;
    }
  }
  
  // Default to English
  return defaultLanguage;
};

export async function middleware(req: NextRequest) {
  // Create a response that we'll modify and return
  let res = NextResponse.next();
  
  // Add enhanced security headers to all responses
  setSecurityHeaders(res);
  
  // Get IP address for rate limiting
  const ip = req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  // Apply rate limiting
  const isAuthRequest = path.startsWith('/api/auth/') || matchesPatterns(path, AUTH_ROUTES);
  const { allowed, remaining, resetTime } = checkRateLimit(ip, isAuthRequest);
  
  // Set rate limit headers
  const maxRequests = isAuthRequest ? AUTH_MAX_REQUESTS : MAX_REQUESTS_PER_WINDOW;
  res.headers.set('X-RateLimit-Limit', maxRequests.toString());
  res.headers.set('X-RateLimit-Remaining', remaining.toString());
  res.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  
  if (!allowed) {
    return new NextResponse(
      JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': Math.ceil(resetTime / 1000).toString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  // Create a Supabase client for auth with cookie support
  const supabase = createMiddlewareClient({ req, res });

  // Get the pathname and full URL
  const path = req.nextUrl.pathname;
  const url = req.nextUrl;
  
  // Handle language detection and setting
  // We're not redirecting to language-specific URLs to keep the implementation simple
  // Instead, we're just setting the preferred language in a cookie
  // This approach avoids issues with URL-based language switching
  const preferredLanguage = getPreferredLanguage(req);
  res.cookies.set('i18nextLng', preferredLanguage, { 
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax'
  });
  
  // Check if this is a special URL that should bypass auth (like Stripe return URLs)
  if (shouldBypassAuth(url)) {
    return res;
  }
  
  // Enhanced brute force protection is now handled by the rate limiting above
  
  // Get the current session from cookies
  const { data: { session } } = await supabase.auth.getSession();
  
  // For admin protected routes
  if (matchesPatterns(path, ADMIN_ROUTES)) {
    // First ensure user is authenticated
    if (!session) {
      const returnUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
    }
    
    // Check if user email is in the admin list
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(",").map(email => email.trim());
    
    if (!session.user.email || !ADMIN_EMAILS.includes(session.user.email)) {
      // Redirect non-admin users to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }
  
  // For regular auth protected routes
  else if (matchesPatterns(path, PROTECTED_ROUTES)) {    
    // If no session, redirect to login
    if (!session) {
      const returnUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
      return NextResponse.redirect(new URL(`/login?returnUrl=${returnUrl}`, req.url));
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
    
    // Admin routes
    '/admin/:path*',
    
    // Auth routes
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    
    // API routes that need auth checks
    '/api/user-subscriptions/:path*',
    '/api/orders/:path*',
    '/api/stripe/subscriptions/:path*',
    '/api/auth/:path*',
    
    // All routes (for language handling)
    '/(.*)',
  ],
};