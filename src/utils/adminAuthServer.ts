// src/utils/adminAuthServer.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from './adminAuth';

/**
 * Get authenticated admin user from API routes (server-side only)
 */
export async function getAuthenticatedAdmin() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user || !user.email) {
      return null;
    }
    
    if (!isAdminEmail(user.email)) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting authenticated admin:', error);
    return null;
  }
}

/**
 * Middleware to verify admin authentication for API routes (server-side only)
 */
export async function verifyAdminRequest(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user || !user.email) {
      return {
        user: null,
        isAdmin: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        )
      };
    }
    
    const isAdmin = isAdminEmail(user.email);
    
    if (!isAdmin) {
      return {
        user,
        isAdmin: false,
        errorResponse: NextResponse.json(
          { success: false, error: 'Admin access required' },
          { status: 403 }
        )
      };
    }
    
    return { user, isAdmin: true, errorResponse: null };
  } catch (error) {
    console.error('Error verifying admin request:', error);
    return {
      user: null,
      isAdmin: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Authentication verification failed' },
        { status: 500 }
      )
    };
  }
}