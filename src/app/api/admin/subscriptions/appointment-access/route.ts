// src/app/api/admin/appointment-access/route.ts
// Updated Admin API for managing user appointment access with proper Supabase integration

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { createClient } from '@supabase/supabase-js';

interface ResetAccessRequest {
  userId: string;
  newDuration?: number; // Optional new duration in seconds
}

interface ResetAccessResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    resetAt: string;
    newDuration: number;
  };
  error?: string;
}

interface ListAccessRequest {
  page?: number;
  limit?: number;
  status?: 'all' | 'expired' | 'active' | 'unused';
}

interface UserAccessInfo {
  userId: string;
  userEmail: string;
  planName: string | null;
  subscriptionStatus: string | null;
  appointmentAccessedAt: string | null;
  appointmentAccessExpired: boolean;
  appointmentAccessDuration: number;
  timeRemaining: number | null;
  accessStatus: 'unused' | 'active' | 'expired';
}

interface ListAccessResponse {
  success: boolean;
  data: {
    users: UserAccessInfo[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
    };
  };
  error?: string;
}

// Initialize Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to check admin permissions
async function isUserAdmin(request: NextRequest): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) return false;
  
  const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim());
  return adminEmails.includes(session.user.email);
}

// GET - List users with appointment access info
export async function GET(request: NextRequest): Promise<NextResponse<ListAccessResponse>> {
  try {
    if (!(await isUserAdmin(request))) {
      return NextResponse.json({
        success: false,
        data: { users: [], pagination: { currentPage: 1, totalPages: 0, totalUsers: 0, limit: 10 } },
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const status = searchParams.get('status') as 'all' | 'expired' | 'active' | 'unused' || 'all';
    
    const offset = (page - 1) * limit;

    // Build query based on status filter
    let query = supabaseAdmin
      .from('user_subscriptions')
      .select(
        `
        user_id,
        user_email,
        plan_name,
        status,
        appointment_accessed_at,
        appointment_access_expired,
        appointment_access_duration,
        created_at,
        updated_at
      `,
        { count: 'exact' }
      )
      .order('updated_at', { ascending: false });

    // Apply status filters
    switch (status) {
      case 'expired':
        query = query.eq('appointment_access_expired', true);
        break;
      case 'active':
        query = query.not('appointment_accessed_at', 'is', null)
                     .eq('appointment_access_expired', false);
        break;
      case 'unused':
        query = query.is('appointment_accessed_at', null)
                     .eq('appointment_access_expired', false);
        break;
      default:
        // 'all' - no additional filter
        break;
    }

    // Get paginated results and total count
    const { data: subscriptions, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    const totalUsers = count || 0;
    const totalPages = Math.ceil(totalUsers / limit);

    if (error) {
      throw new Error(`Failed to fetch appointment access data: ${error.message}`);
    }

    const now = new Date();
    const users: UserAccessInfo[] = (subscriptions || []).map(row => {
      let accessStatus: 'unused' | 'active' | 'expired';
      let timeRemaining: number | null = null;

      if (!row.appointment_accessed_at) {
        accessStatus = 'unused';
      } else if (row.appointment_access_expired) {
        accessStatus = 'expired';
      } else {
        // Calculate time remaining
        const accessedAt = new Date(row.appointment_accessed_at);
        const expiresAt = new Date(accessedAt.getTime() + (row.appointment_access_duration * 1000));
        timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
        
        accessStatus = timeRemaining > 0 ? 'active' : 'expired';
      }

      return {
        userId: row.user_id,
        userEmail: row.user_email,
        planName: row.plan_name,
        subscriptionStatus: row.status,
        appointmentAccessedAt: row.appointment_accessed_at,
        appointmentAccessExpired: row.appointment_access_expired || false,
        appointmentAccessDuration: row.appointment_access_duration || 600,
        timeRemaining,
        accessStatus
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Error listing appointment access:', error);
    return NextResponse.json({
      success: false,
      data: { users: [], pagination: { currentPage: 1, totalPages: 0, totalUsers: 0, limit: 10 } },
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

// POST - Reset user appointment access
export async function POST(request: NextRequest): Promise<NextResponse<ResetAccessResponse>> {
  try {
    if (!(await isUserAdmin(request))) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'Admin access required'
      }, { status: 401 });
    }

    const body: ResetAccessRequest = await request.json();
    
    if (!body.userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required',
        error: 'Missing userId parameter'
      }, { status: 400 });
    }

    const newDuration = body.newDuration || 600; // Default 10 minutes

    // Validate duration (between 1 minute and 2 hours)
    if (newDuration < 60 || newDuration > 7200) {
      return NextResponse.json({
        success: false,
        message: 'Duration must be between 60 seconds (1 minute) and 7200 seconds (2 hours)',
        error: 'Invalid duration'
      }, { status: 400 });
    }

    // Check if user has active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, user_email, plan_name')
      .eq('user_id', body.userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError || !subscriptionData) {
      return NextResponse.json({
        success: false,
        message: 'No active subscription found for this user',
        error: 'User must have active subscription'
      }, { status: 404 });
    }

    const resetAt = new Date().toISOString();

    // Reset appointment access
    const { error: updateError } = await supabaseAdmin
      .from('user_subscriptions')
      .update({
        appointment_accessed_at: null,
        appointment_access_expired: false,
        appointment_access_duration: newDuration,
        updated_at: resetAt
      })
      .eq('user_id', body.userId)
      .eq('status', 'active');

    if (updateError) {
      throw new Error(`Failed to reset appointment access: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Appointment access reset for user ${subscriptionData.user_email}`,
      data: {
        userId: body.userId,
        resetAt,
        newDuration
      }
    });

  } catch (error) {
    console.error('Error resetting appointment access:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to reset appointment access',
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}